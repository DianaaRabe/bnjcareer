import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60; // Allow up to 60s for LLM response

interface JobData {
  title: string;
  company?: string;
  description: string;
  url?: string;
  requirements?: string[];
}

interface MatchAnalysis {
  score: number;
  verdict?: string;
  reasons?: string[];
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

    const { cvData, job, matchAnalysis } = (await req.json()) as {
      cvData: any;
      job: JobData;
      matchAnalysis?: MatchAnalysis;
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
      userSkills?.map((s: any) => (s.skills as any)?.name).filter(Boolean) ||
      [];

    // ── Fetch latest CV record for base_cv_id ────────────────────────────
    const { data: latestCv } = await supabase
      .from("cvs")
      .select("id, pdf_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // ── Insert job_cv_versions record with 'processing' status ───────────
    const admin = createAdminClient();
    const { data: versionRecord, error: insertError } = await admin
      .from("job_cv_versions")
      .insert({
        user_id: user.id,
        job_title: job.title,
        job_company: job.company || null,
        job_description: job.description,
        job_url: job.url || null,
        base_cv_id: latestCv?.id || null,
        match_score_before: matchAnalysis?.score || null,
        cv_data: cvData,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError || !versionRecord) {
      console.error("[cv-optimize-job] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create optimization record" },
        { status: 500 }
      );
    }

    // ── Build the job-specific LLM prompt ────────────────────────────────
    const systemPrompt = buildJobOptimizationPrompt(
      profile,
      skillNames,
      cvData,
      job,
      matchAnalysis
    );

    // ── Call OpenRouter LLM ──────────────────────────────────────────────
    const llmResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            req.headers.get("origin") || "http://localhost:3000",
          "X-Title": "BNJ Skills Maker - Job CV Optimizer",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                "Optimise ce CV pour ce poste spécifique maintenant. Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte avant ou après.",
            },
          ],
          temperature: 0.3,
          max_tokens: 10000,
        }),
      }
    );

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error("[cv-optimize-job] LLM API error:", errText);
      await admin
        .from("job_cv_versions")
        .update({ status: "failed" })
        .eq("id", versionRecord.id);
      return NextResponse.json(
        { error: "AI optimization failed" },
        { status: 502 }
      );
    }

    const llmData = await llmResponse.json();
    const rawContent = llmData.choices?.[0]?.message?.content || "";

    // ── Parse the JSON from LLM response ─────────────────────────────────
    let optimizedHtml = "";
    let improvements: any[] = [];
    let matchSummary = "";

    try {
      let jsonStr = rawContent.trim();

      // Remove markdown code fences if present
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?```\s*$/, "");
      }

      const parsed = JSON.parse(jsonStr);
      optimizedHtml = parsed.optimized_html || "";
      improvements = parsed.improvements || [];
      matchSummary = parsed.match_summary || "";
    } catch (parseErr) {
      console.error("[cv-optimize-job] JSON parse error:", parseErr);
      console.error(
        "[cv-optimize-job] Raw content:",
        rawContent.substring(0, 500)
      );

      // Attempt to salvage JSON from response
      const jsonMatch = rawContent.match(
        /\{[\s\S]*"optimized_html"[\s\S]*\}/
      );
      if (jsonMatch) {
        try {
          const fallback = JSON.parse(jsonMatch[0]);
          optimizedHtml = fallback.optimized_html || "";
          improvements = fallback.improvements || [];
          matchSummary = fallback.match_summary || "";
        } catch {
          await admin
            .from("job_cv_versions")
            .update({ status: "failed" })
            .eq("id", versionRecord.id);
          return NextResponse.json(
            { error: "Failed to parse AI response" },
            { status: 500 }
          );
        }
      } else {
        await admin
          .from("job_cv_versions")
          .update({ status: "failed" })
          .eq("id", versionRecord.id);
        return NextResponse.json(
          { error: "Failed to parse AI response" },
          { status: 500 }
        );
      }
    }

    // ── Update the record with results ───────────────────────────────────
    const { error: updateError } = await admin
      .from("job_cv_versions")
      .update({
        optimized_html: optimizedHtml,
        improvements,
        match_summary: matchSummary,
        status: "completed",
      })
      .eq("id", versionRecord.id);

    if (updateError) {
      console.error("[cv-optimize-job] Update error:", updateError);
    }

    return NextResponse.json({
      success: true,
      version: {
        id: versionRecord.id,
        job_title: job.title,
        job_company: job.company || null,
        optimized_html: optimizedHtml,
        improvements,
        match_summary: matchSummary,
        match_score_before: matchAnalysis?.score || null,
        status: "completed",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[cv-optimize-job] Server error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── Job-Specific LLM Prompt Builder ──────────────────────────────────────────

function buildJobOptimizationPrompt(
  profile: any,
  skills: string[],
  cvData: any,
  job: JobData,
  matchAnalysis?: MatchAnalysis
): string {
  const mainGoalLabels: Record<string, string> = {
    find_job: "Trouver un emploi",
    improve_cv: "Améliorer mon CV",
    change_career: "Changer de carrière",
    learn_skills: "Développer mes compétences",
    network: "Développer mon réseau",
  };

  const educationLabels: Record<string, string> = {
    no_diploma: "Sans diplôme",
    bac: "Baccalauréat",
    "bac+2": "Bac+2 (BTS/DUT)",
    "bac+3": "Bac+3 (Licence)",
    "bac+5": "Bac+5 (Master/Ingénieur)",
    phd: "Doctorat",
    other: "Autre",
  };

  // Build requirements string
  const requirementsStr = job.requirements?.length
    ? `\n### Compétences requises par l'offre\n${job.requirements.map((r) => `- ${r}`).join("\n")}`
    : "";

  // Build match analysis context
  const matchContext = matchAnalysis
    ? `
## ANALYSE DE MATCHING EXISTANTE
- Score actuel de compatibilité : ${matchAnalysis.score}%
- Verdict : ${matchAnalysis.verdict || "Non disponible"}
- Points identifiés :
${matchAnalysis.reasons?.map((r) => `  - ${r}`).join("\n") || "  - Aucun détail"}

Tu dois utiliser ces informations pour cibler précisément les lacunes et maximiser la compatibilité.`
    : "";

  return `Tu es un expert senior en rédaction de CV, spécialisé dans l'optimisation ciblée pour des postes spécifiques.
Tu as 15 ans d'expérience en recrutement et tu connais parfaitement les algorithmes ATS et les attentes des recruteurs.

## MISSION CRITIQUE
Adapte le CV ci-dessous pour MAXIMISER les chances d'être sélectionné pour ce poste SPÉCIFIQUE.
Tu dois créer une version du CV parfaitement alignée avec cette offre d'emploi.

## OFFRE D'EMPLOI CIBLE
### Titre du poste : ${job.title}
### Entreprise : ${job.company || "Non spécifiée"}
### Description complète de l'offre :
${job.description}
${requirementsStr}

${matchContext}

## PROFIL DU CANDIDAT
- Nom : ${profile?.first_name || "Non renseigné"} ${profile?.last_name || ""}
- Niveau d'études : ${educationLabels[profile?.education_level] || profile?.education_level || "Non renseigné"}
- Secteur visé : ${profile?.industry || "Non renseigné"}
- Statut actuel : ${profile?.current_status || "Non renseigné"}
- Objectif principal : ${mainGoalLabels[profile?.main_goal] || profile?.main_goal || "Non défini"}
- Forces : ${JSON.stringify(profile?.strengths || [])}
- Faiblesses à travailler : ${JSON.stringify(profile?.weaknesses || [])}
- Compétences : ${JSON.stringify(skills)}
- Bio : ${profile?.bio || "Non renseignée"}

## DONNÉES CV EXISTANT
${JSON.stringify(cvData, null, 2)}

## STRATÉGIE D'OPTIMISATION POUR CE POSTE

### 1. Alignement des mots-clés
- Identifie TOUS les mots-clés importants de l'offre (hard skills, soft skills, outils, méthodologies)
- Intègre-les naturellement dans le CV aux endroits pertinents
- Utilise les MÊMES TERMES que l'offre (pas de synonymes quand le mot exact est important)

### 2. Réorganisation stratégique
- Place en premier les expériences les plus pertinentes pour ce poste
- Mets en avant les compétences qui matchent directement avec les exigences
- Ajuste le résumé professionnel pour cibler spécifiquement ce poste

### 3. Comblement des lacunes
- Si le candidat a des compétences transférables qui couvrent un gap, mets-les en avant
- Reformule les expériences existantes pour faire ressortir la pertinence
- ⚠️ NE JAMAIS INVENTER de fausses expériences ou compétences
- ⚠️ SEULEMENT reformuler et réorganiser le contenu existant

### 4. Optimisation ATS ciblée
- Structure avec des sections standards (Profil, Expérience, Formation, Compétences)
- Bullet points commençant par des verbes d'action pertinents pour ce domaine
- Quantification des résultats quand c'est plausible
- Format linéaire sans tableaux ni colonnes CSS

## ⚠️ CONTRAINTES ABSOLUES
- NE PAS inventer d'expériences ou de données fictives
- NE PAS ajouter de compétences que le candidat ne possède pas
- SEULEMENT reformuler et réorganiser le contenu EXISTANT
- Rester réaliste et crédible
- Garder un ton professionnel

## FORMAT DE SORTIE
Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks) :
{
  "optimized_html": "<div style='...'>... HTML complet du CV optimisé pour ce poste ...</div>",
  "improvements": [
    { "type": "keyword", "description": "Description de ce qui a été ajouté/modifié", "impact": "high" },
    { "type": "rephrasing", "description": "Description", "impact": "medium" },
    { "type": "reordering", "description": "Description", "impact": "high" },
    { "type": "gap_coverage", "description": "Description", "impact": "medium" }
  ],
  "match_summary": "Résumé en 2-3 phrases de comment le CV est maintenant mieux aligné avec ce poste."
}

## TYPES D'AMÉLIORATIONS
- "keyword" : mot-clé de l'offre ajouté/intégré dans le CV
- "rephrasing" : description d'expérience reformulée pour mieux matcher
- "reordering" : sections ou expériences réordonnées pour pertinence
- "gap_coverage" : compétence transférable mise en avant pour couvrir un gap
- "structure" : amélioration structurelle ATS
- "profile" : résumé professionnel adapté au poste

## IMPACT LEVELS
- "high" : changement critique pour ce poste spécifique
- "medium" : amélioration significative de l'alignement
- "low" : ajustement mineur

## RÈGLES HTML STRICTES
- Le HTML doit être dans un seul <div> racine
- Style inline uniquement (pas de <style> tags)
- Police : font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif
- Couleur texte principal : #1e293b
- Couleur accents/titres de section : #590293
- Couleur bordures subtiles : #e2e8f0
- Fond des sections alternées : #f8fafc
- Taille titre nom : 28px, bold
- Taille titres sections : 16px, uppercase, letter-spacing 1px
- Taille texte normal : 13px, line-height 1.6
- max-width : 800px, margin 0 auto, padding 40px
- Séparateurs entre sections : border-bottom 2px solid #590293
- Le HTML doit être complet, autonome et directement imprimable`;
}
