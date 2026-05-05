import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/formations/[id]/enroll — check enrollment status
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ enrolled: false });

    const { data } = await supabase
      .from("formation_enrollments")
      .select("id, progress_pct, completed_at, has_badge, certificate_url")
      .eq("formation_id", params.id)
      .eq("student_id", user.id)
      .single();

    return NextResponse.json({ enrolled: !!data, enrollment: data || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/formations/[id]/enroll — student enrolls in formation
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Check formation exists and is published
    const { data: formation } = await admin
      .from("formations")
      .select("id, max_students, is_published")
      .eq("id", params.id)
      .single();

    if (!formation || !formation.is_published) {
      return NextResponse.json(
        { error: "Formation introuvable ou non publiée" },
        { status: 404 }
      );
    }

    // Check max_students if set
    if (formation.max_students) {
      const { count } = await admin
        .from("formation_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("formation_id", params.id);

      if (count && count >= formation.max_students) {
        return NextResponse.json(
          { error: "Cette formation est complète" },
          { status: 409 }
        );
      }
    }

    // Upsert enrollment (avoid duplicates)
    const { data: enrollment, error: insertError } = await admin
      .from("formation_enrollments")
      .upsert(
        {
          formation_id: params.id,
          student_id: user.id,
          progress_pct: 0,
          has_badge: false,
        },
        { onConflict: "formation_id,student_id" }
      )
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (err: any) {
    console.error("[enroll POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
