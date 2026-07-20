import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callLLM, LLMError } from "@/lib/llm/client";
import {
  extractImmutableContact,
  formatImmutableExperiences,
  formatImmutableEducation,
  formatCvExtras,
} from "@/lib/cv/immutable";

export const maxDuration = 60;

interface JobData {
  title: string;
  company?: string;
  description: string;
  url?: string;
  requirements?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cvData, job } = (await req.json()) as {
      cvData: any;
      job: JobData;
    };

    if (!cvData || !job?.title || !job?.description) {
      return NextResponse.json(
        { error: "CV data, job title, and job description are required" },
        { status: 400 }
      );
    }

    // ── Fetch enriched user profile ──────────────────────────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // ── Fetch user skills ────────────────────────────────────────────────
    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("skill_id, skills(name)")
      .eq("user_id", user.id);

    const skillNames =
      userSkills?.map((s: any) => (s.skills as any)?.name).filter(Boolean) || [];

    const systemPrompt = buildCoverLetterPrompt(profile, skillNames, cvData, job);

    let subject = "";
    let body = "";

    try {
      const { content: rawContent, model } = await callLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              "Rédige la lettre de motivation maintenant. Réponds UNIQUEMENT avec le JSON demandé {\"subject\": ..., \"body\": ...}, sans aucun texte avant ou après.",
          },
        ],
        temperature: 0.5,
        maxTokens: 2500,
        jsonMode: true,
        referer: req.headers.get("origin") || undefined,
      });
      console.log(`[cover-letter] LLM used: ${model}`);

      const parsed = extractCoverLetter(rawContent);
      subject = parsed.subject;
      body = parsed.body;
    } catch (err) {
      if (err instanceof LLMError) {
        console.error("[cover-letter] All LLM models failed:", err.attempts);
        return NextResponse.json(
          { error: "AI generation failed" },
          { status: 502 }
        );
      }
      console.error("[cover-letter] JSON parse error:", err);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cover_letter: {
        subject,
        body,
        job_title: job.title,
        job_company: job.company || null,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[cover-letter] Server error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── Parse the LLM JSON response ──────────────────────────────────────────────

function extractCoverLetter(raw: string): { subject: string; body: string } {
  let text = raw.trim();
  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) text = fenceMatch[1].trim();

  try {
    const parsed = JSON.parse(text);
    const subject = String(parsed.subject || parsed.objet || "").trim();
    const body = String(parsed.body || parsed.corps || parsed.content || "").trim();
    if (!body) throw new Error("empty body");
    return { subject: subject || "Candidature", body };
  } catch {
    // Fallback: treat the whole response as the body
    if (text.length > 0) {
      return { subject: "Candidature", body: text };
    }
    throw new Error("Could not extract cover letter from LLM response");
  }
}

// ─── Cover Letter LLM Prompt Builder ──────────────────────────────────────────

function buildCoverLetterPrompt(
  profile: any,
  skills: string[],
  cvData: any,
  job: JobData
): string {
  const immutable = extractImmutableContact(cvData, profile);
  const immutableExperiences = formatImmutableExperiences(cvData);
  const immutableEducation = formatImmutableEducation(cvData);
  const cvExtras = formatCvExtras(cvData);

  const candidateName = immutable.name || "[Nom du candidat]";
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `Tu es un expert en rédaction de lettres de motivation, spécialisé dans le marché de l'emploi francophone.
Tu rédiges des lettres percutantes, sincères et professionnelles, parfaitement adaptées au poste visé.

## ⚠️ RÈGLES INVIOLABLES
1. N'INVENTE JAMAIS d'expérience, de diplôme, d'entreprise ou de compétence qui ne figure pas dans les données ci-dessous.
2. Utilise UNIQUEMENT les vraies informations du candidat (contact, expériences, formations, compétences fournies).
3. Le nom du candidat est EXACTEMENT : "${candidateName}". Ne le modifie pas.
4. Écris en français, dans un registre professionnel mais humain (évite les formules creuses et les clichés).
5. La lettre doit être personnalisée pour CE poste précis, en reliant les vraies expériences du candidat aux besoins de l'offre.

## CANDIDAT — CONTACT (à ne jamais modifier)
- Nom : ${candidateName}
- Email : ${immutable.email || "(non renseigné)"}
- Téléphone : ${immutable.phone || "(non renseigné)"}
- Localisation : ${immutable.location || "(non renseignée)"}

## CANDIDAT — EXPÉRIENCES (réelles, à valoriser sans rien inventer)
${immutableExperiences}

## CANDIDAT — FORMATIONS (réelles)
${immutableEducation}

## CANDIDAT — INFOS COMPLÉMENTAIRES (CV)
${cvExtras}

## CANDIDAT — PROFIL
- Compétences (profil) : ${skills.length ? skills.join(", ") : "(aucune renseignée)"}
- Objectif principal : ${profile?.main_goal || "(non renseigné)"}
- Bio : ${profile?.bio || "(non renseignée)"}

## OFFRE D'EMPLOI CIBLE
- Intitulé : ${job.title}
- Entreprise : ${job.company || "(non précisée)"}
- Description de l'offre :
${job.description}
${job.requirements?.length ? `- Exigences clés : ${job.requirements.join(", ")}` : ""}

## STRUCTURE ATTENDUE DE LA LETTRE (dans le champ "body")
- En-tête : nom du candidat + coordonnées, puis la date (${today}), puis l'entreprise destinataire.
- Objet clair mentionnant le poste.
- Formule d'appel (ex : "Madame, Monsieur,").
- Paragraphe 1 : accroche + intérêt pour le poste et l'entreprise.
- Paragraphe 2 : mise en avant des expériences et compétences RÉELLES les plus pertinentes pour l'offre.
- Paragraphe 3 : motivation, projection dans le poste, valeur apportée.
- Formule de politesse finale + signature (nom du candidat).
- Longueur : ~300 à 400 mots, une seule page.

## FORMAT DE SORTIE (JSON STRICT)
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{
  "subject": "Objet de la lettre (ex : Candidature au poste de ...)",
  "body": "Le texte complet de la lettre, avec des sauts de ligne \\n entre les paragraphes."
}`;
}
