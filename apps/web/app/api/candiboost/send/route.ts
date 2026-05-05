import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCandidatureEmail } from "@/lib/brevo";

export const maxDuration = 60; // Allow up to 60s for email sending

// ── POST /api/candiboost/send ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth guard ──────────────────────────────────────────────────────
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    // ── 2. Parse & validate payload ────────────────────────────────────────
    const body = await req.json();
    console.log("[candiboost/send] 📩 Nouvelle requête d'envoi reçue:", {
      userId: user.id,
      body: {
        jobOfferId: body.jobOfferId,
        companyEmail: body.companyEmail,
        jobTitle: body.jobTitle,
        hasCoverLetter: !!body.coverLetter,
        isGeneric: body.isGeneric,
        hasCvBase64: !!body.cvBase64,
      },
    });

    let {
      jobOfferId,
      companyEmail,
      jobTitle,
      coverLetter,
      isGeneric,
      cvBase64: clientCvBase64,
    } = body as {
      jobOfferId?: string;
      companyEmail: string;
      jobTitle: string;
      coverLetter: string | null;
      isGeneric?: boolean;
      cvBase64?: string;
    };

    // --- TEMPORAIRE POUR LE TEST ---
    companyEmail = "rabemanantsoafanilo8@gmail.com";
    console.log("⚠️ [MODE TEST] Email de destination forcé à :", companyEmail);
    // --------------------------------

    if (!companyEmail || !jobTitle) {
      return NextResponse.json(
        { error: "companyEmail et jobTitle sont requis." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyEmail)) {
      return NextResponse.json(
        { error: "Format d'email invalide." },
        { status: 400 }
      );
    }

    // ── 3. Fetch user profile ──────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const candidatFullName =
      `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
      "Candidat";
    const candidatEmail = user.email;
    console.log(
      `[candiboost/send] 👤 Profil candidat: ${candidatFullName} (${candidatEmail})`
    );

    if (!candidatEmail) {
      return NextResponse.json(
        { error: "Email du candidat introuvable." },
        { status: 400 }
      );
    }

    // ── 4. Resolve CV PDF (Generic vs Client-Provided) ─────────────────────
    let finalCvBase64 = clientCvBase64;

    if (isGeneric) {
      console.log(
        `[candiboost/send] 🔍 Recherche du CV générique pour ${user.id}`
      );
      
      // Look for the main uploaded CV in public.cvs
      const { data: genericCv } = await supabase
        .from("cvs")
        .select("pdf_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!genericCv || !genericCv.pdf_url) {
        // Fallback to cv_optimizations generic if any
        const { data: optCv } = await supabase
          .from("cv_optimizations")
          .select("optimized_cv_url")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (optCv && optCv.optimized_cv_url) {
          console.log(`[candiboost/send] 📥 Fetching from cv_optimizations: ${optCv.optimized_cv_url}`);
          const response = await fetch(optCv.optimized_cv_url);
          const buffer = await response.arrayBuffer();
          finalCvBase64 = Buffer.from(buffer).toString("base64");
        } else {
          console.warn(`[candiboost/send] ⚠️ Aucun CV générique trouvé`);
          return NextResponse.json(
            {
              error:
                "Aucun CV générique trouvé. Veuillez en uploader un dans la section 'Mon CV'.",
            },
            { status: 404 }
          );
        }
      } else {
        try {
          console.log(
            `[candiboost/send] 📥 Téléchargement du CV générique: ${genericCv.pdf_url}`
          );
          const response = await fetch(genericCv.pdf_url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} failed to download CV`);
          }
          const buffer = await response.arrayBuffer();
          finalCvBase64 = Buffer.from(buffer).toString("base64");
          console.log(`[candiboost/send] ✅ CV générique converti en Base64.`);
        } catch (downloadErr) {
          console.error(
            "[candiboost/send] ❌ Erreur téléchargement CV:",
            downloadErr
          );
          return NextResponse.json(
            { error: "Impossible de récupérer le fichier de votre CV générique." },
            { status: 500 }
          );
        }
      }
    } else if (!finalCvBase64) {
      console.warn(`[candiboost/send] ⚠️ Aucun cvBase64 fourni dans la requête`);
      return NextResponse.json(
        {
          error:
            "Aucun fichier CV fourni. La génération côté client a probablement échoué.",
        },
        { status: 400 }
      );
    }

    // ── 6. Send email via Brevo ────────────────────────────────────────────
    try {
      console.log(
        `[candiboost/send] 📧 Envoi de l'email via Brevo à ${companyEmail}...`
      );
      const brevoResult = await sendCandidatureEmail({
        candidatFullName,
        candidatEmail,
        companyEmail,
        jobTitle,
        cvBase64: finalCvBase64!,
        coverLetter: coverLetter || null,
      });
      console.log(
        "[candiboost/send] 🚀 Email envoyé avec succès. MessageId:",
        brevoResult?.messageId
      );
    } catch (brevoError: any) {
      console.error("[candiboost/send] Brevo error:", brevoError);

      const statusCode = brevoError?.statusCode || brevoError?.status;
      const message =
        brevoError?.body?.message ||
        brevoError?.message ||
        "Erreur lors de l'envoi de l'email.";

      if (statusCode === 401 || statusCode === 403) {
        return NextResponse.json(
          { error: "Erreur d'authentification Brevo. Contactez le support." },
          { status: 502 }
        );
      }
      if (statusCode === 429) {
        return NextResponse.json(
          {
            error:
              "Quota d'envoi Brevo dépassé. Veuillez réessayer plus tard.",
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Échec de l'envoi : ${message}` },
        { status: 502 }
      );
    }

    // ── 7. Log the send in applications table ──────────────────────────────
    const admin = createAdminClient();

    const { error: logError } = await admin.from("applications").insert({
      user_id: user.id,
      job_offer_id: null,
      company_email: companyEmail,
      job_title: jobTitle,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    if (logError) {
      console.error("[candiboost/send] ❌ Log insert error:", logError);
    } else {
      console.log(
        "[candiboost/send] 📝 Envoi historisé avec succès dans la table 'applications'"
      );
    }

    // ── 8. Return success ──────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: `Candidature envoyée avec succès à ${companyEmail}`,
      data: {
        companyEmail,
        jobTitle,
        candidatFullName,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[candiboost/send] Server error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
