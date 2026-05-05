import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60; // Allow up to 60s for LLM response

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

    const { cvData } = await req.json();

    if (!cvData) {
      return NextResponse.json(
        { error: "CV data is required" },
        { status: 400 }
      );
    }

    // Fetch enriched user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fetch user skills
    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("skill_id, skills(name)")
      .eq("user_id", user.id);

    const skillNames =
      userSkills?.map((s: any) => (s.skills as any)?.name).filter(Boolean) ||
      [];

    // Fetch latest CV record for original URL
    const { data: latestCv } = await supabase
      .from("cvs")
      .select("pdf_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const originalCvUrl = latestCv?.pdf_url || "";

    // Insert optimization record with 'processing' status
    const admin = createAdminClient();
    const { data: optRecord, error: insertError } = await admin
      .from("cv_optimizations")
      .insert({
        user_id: user.id,
        original_cv_url: originalCvUrl,
        cv_data: cvData,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError || !optRecord) {
      console.error("[cv-optimize] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create optimization record" },
        { status: 500 }
      );
    }

    // Build LLM prompt
    const systemPrompt = buildOptimizationPrompt(
      profile,
      skillNames,
      cvData
    );

    // Call OpenRouter LLM
    const llmResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            req.headers.get("origin") || "http://localhost:3000",
          "X-Title": "BNJ Skills Maker - CV Optimizer",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                "Optimise ce CV maintenant. Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte avant ou après.",
            },
          ],
          temperature: 0.3,
          max_tokens: 8000,
        }),
      }
    );

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error("[cv-optimize] LLM API error:", errText);
      await admin
        .from("cv_optimizations")
        .update({ status: "failed" })
        .eq("id", optRecord.id);
      return NextResponse.json(
        { error: "AI optimization failed" },
        { status: 502 }
      );
    }

    const llmData = await llmResponse.json();
    const rawContent =
      llmData.choices?.[0]?.message?.content || "";

    // Parse the JSON from LLM response
    let optimizedHtml = "";
    let improvements: any[] = [];

    try {
      // Try to extract JSON from potential markdown code blocks
      let jsonStr = rawContent.trim();
      
      // Remove markdown code fences if present
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }

      const parsed = JSON.parse(jsonStr);
      optimizedHtml = parsed.optimized_html || "";
      improvements = parsed.improvements || [];
    } catch (parseErr) {
      console.error("[cv-optimize] JSON parse error:", parseErr);
      console.error("[cv-optimize] Raw content:", rawContent.substring(0, 500));

      // Attempt to salvage: look for JSON within the response
      const jsonMatch = rawContent.match(/\{[\s\S]*"optimized_html"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const fallback = JSON.parse(jsonMatch[0]);
          optimizedHtml = fallback.optimized_html || "";
          improvements = fallback.improvements || [];
        } catch {
          await admin
            .from("cv_optimizations")
            .update({ status: "failed" })
            .eq("id", optRecord.id);
          return NextResponse.json(
            { error: "Failed to parse AI response" },
            { status: 500 }
          );
        }
      } else {
        await admin
          .from("cv_optimizations")
          .update({ status: "failed" })
          .eq("id", optRecord.id);
        return NextResponse.json(
          { error: "Failed to parse AI response" },
          { status: 500 }
        );
      }
    }

    // Update the record with results
    const { error: updateError } = await admin
      .from("cv_optimizations")
      .update({
        optimized_html: optimizedHtml,
        improvements,
        status: "completed",
      })
      .eq("id", optRecord.id);

    if (updateError) {
      console.error("[cv-optimize] Update error:", updateError);
    }

    return NextResponse.json({
      success: true,
      optimization: {
        id: optRecord.id,
        optimized_html: optimizedHtml,
        improvements,
        original_cv_url: originalCvUrl,
        status: "completed",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[cv-optimize] Server error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── LLM Prompt Builder ─────────────────────────────────────────────────────

function buildOptimizationPrompt(
  profile: any,
  skills: string[],
  cvData: any
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

  return `Tu es un expert senior en rédaction de CV et en systèmes ATS (Applicant Tracking Systems).
Tu as 15 ans d'expérience en recrutement et tu connais parfaitement les algorithmes de parsing ATS.

## MISSION
Optimise le CV ci-dessous pour maximiser les chances de passer les filtres ATS et impressionner les recruteurs humains.

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

## RÈGLES D'OPTIMISATION ATS
1. **Structure ATS-compatible** : Utiliser des titres de section standards que les ATS reconnaissent (Profil Professionnel, Expérience Professionnelle, Formation, Compétences Techniques, Langues, Centres d'intérêt)
2. **Mots-clés sectoriels** : Intégrer des mots-clés pertinents pour le secteur "${profile?.industry || "général"}" que les ATS recherchent
3. **Bullet points actionnables** : Chaque expérience doit avoir 3-5 bullet points commençant par un verbe d'action au passé (Développé, Géré, Optimisé, Coordonné, Mis en place...)
4. **Quantification des résultats** : Ajouter des métriques et résultats concrets quand c'est plausible (+X%, X projets, X personnes managées...)
5. **Résumé professionnel** : Écrire un résumé de 2-3 lignes percutantes en haut du CV, aligné avec l'objectif "${mainGoalLabels[profile?.main_goal] || "professionnel"}"
6. **Compétences organisées** : Organiser en catégories claires (Techniques, Soft Skills, Outils & Logiciels)
7. **Formatage ATS-safe** : AUCUN tableau, AUCUNE colonne CSS, AUCUN élément graphique complexe. Les ATS ne lisent que du texte linéaire.
8. **Longueur** : Optimiser pour 1-2 pages imprimables
9. **Dates** : Format standard français (Janvier 2023 - Présent)
10. **Contact** : Inclure email, téléphone, ville si disponibles

## FORMAT DE SORTIE
Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks, pas de commentaires) :
{
  "optimized_html": "<div style='...'>... HTML complet du CV optimisé ...</div>",
  "improvements": [
    { "category": "structure", "description": "Description de l'amélioration", "impact": "high" },
    { "category": "keywords", "description": "Description", "impact": "high" },
    { "category": "content", "description": "Description", "impact": "medium" }
  ]
}

## CATÉGORIES D'AMÉLIORATIONS POSSIBLES
- "structure" : réorganisation, sections, ordre
- "keywords" : ajout de mots-clés ATS
- "content" : réécriture de descriptions, bullet points
- "formatting" : mise en forme, lisibilité
- "skills" : section compétences améliorée
- "profile" : résumé professionnel ajouté/amélioré

## IMPACT LEVELS
- "high" : changement critique pour le passage ATS
- "medium" : amélioration significative
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
