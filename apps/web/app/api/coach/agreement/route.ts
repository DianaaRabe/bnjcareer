import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Snapshot of the revenue split terms at signature time.
// If you change these defaults later, bump CURRENT_CONTRACT_VERSION on the
// page and existing coaches will be prompted to re-sign.
const SUBSCRIPTION_SHARE_COACH_PCT = 25;
const FORMATION_SHARE_PLATFORM_PCT = 25;

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Only coaches may sign this agreement
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "coach") {
    return NextResponse.json({ error: "Réservé aux coachs" }, { status: 403 });
  }

  // Validate payload
  let body: { contractVersion?: string; signedName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const contractVersion = (body.contractVersion ?? "").trim();
  const signedName = (body.signedName ?? "").trim();

  if (!contractVersion) {
    return NextResponse.json({ error: "Version du contrat manquante" }, { status: 400 });
  }
  if (signedName.length < 3) {
    return NextResponse.json({ error: "Nom de signature trop court" }, { status: 400 });
  }

  // Idempotency: if already signed for this version, return success silently
  const { data: existing } = await supabase
    .from("coach_agreements")
    .select("id")
    .eq("coach_id", user.id)
    .eq("contract_version", contractVersion)
    .is("revoked_at", null)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, alreadySigned: true });
  }

  // Capture audit metadata
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  // Use admin client to bypass RLS on INSERT (we already verified the user)
  // and to store IP/user-agent which the user can't write through RLS.
  const admin = createAdminClient();
  const { error: insertErr } = await admin.from("coach_agreements").insert({
    coach_id: user.id,
    contract_version: contractVersion,
    signed_name: signedName,
    subscription_share_coach_pct: SUBSCRIPTION_SHARE_COACH_PCT,
    formation_share_platform_pct: FORMATION_SHARE_PLATFORM_PCT,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (insertErr) {
    console.error("[coach/agreement] insert error:", insertErr);
    return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
