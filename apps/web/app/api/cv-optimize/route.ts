import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callLLM, extractCVOptimization, LLMError } from "@/lib/llm/client";
import {
  extractImmutableContact,
  formatImmutableExperiences,
  formatImmutableEducation,
} from "@/lib/cv/immutable";

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

    // Call LLM via the centralized wrapper (with fallback chain)
    let optimizedHtml = "";
    let improvements: any[] = [];

    try {
      const { content: rawContent, model } = await callLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              "Optimise ce CV maintenant. Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte avant ou après.",
          },
        ],
        temperature: 0.3,
        maxTokens: 6000,
        jsonMode: true,
        referer: req.headers.get("origin") || undefined,
      });
      console.log(`[cv-optimize] LLM used: ${model}`);

      const parsed = extractCVOptimization(rawContent);
      optimizedHtml = parsed.optimized_html;
      improvements = parsed.improvements;
    } catch (err) {
      if (err instanceof LLMError) {
        console.error("[cv-optimize] All LLM models failed:", err.attempts);
        await admin.from("cv_optimizations").update({ status: "failed" }).eq("id", optRecord.id);
        return NextResponse.json({ error: "AI optimization failed" }, { status: 502 });
      }
      console.error("[cv-optimize] JSON parse error:", err);
      await admin.from("cv_optimizations").update({ status: "failed" }).eq("id", optRecord.id);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
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

  const immutable = extractImmutableContact(cvData, profile);
  const immutableExperiences = formatImmutableExperiences(cvData);
  const immutableEducation   = formatImmutableEducation(cvData);

  return `Tu es un expert senior en rédaction de CV et en systèmes ATS (Applicant Tracking Systems).
Tu as 15 ans d'expérience en recrutement et tu connais parfaitement les algorithmes de parsing ATS.

## ⚠️⚠️⚠️ RÈGLES INVIOLABLES — LIS ET RESPECTE CETTE SECTION AVANT TOUT ⚠️⚠️⚠️

Ton rôle est de **reformuler** et **réorganiser** le CV pour mieux passer les filtres ATS.
Tu n'es PAS rédacteur fiction. Tu NE peux PAS inventer, embellir ou fabriquer des faits.

### A. INFORMATIONS DE CONTACT — RECOPIE-LES VERBATIM, NE LES MODIFIE JAMAIS
- Nom complet  : "${immutable.name ?? "(NON RENSEIGNÉ — écris 'Non renseigné' et N'INVENTE PAS)"}"
- Email        : "${immutable.email ?? "(NON RENSEIGNÉ — écris 'Non renseigné' et NE FABRIQUE PAS d'email)"}"
- Téléphone    : "${immutable.phone ?? "(NON RENSEIGNÉ — écris 'Non renseigné' et NE FABRIQUE PAS de numéro)"}"
- Localisation : "${immutable.location ?? "(NON RENSEIGNÉ — écris 'Non renseigné' et NE FABRIQUE PAS de ville)"}"
- LinkedIn     : "${immutable.linkedin ?? "(NON RENSEIGNÉ — laisse vide)"}"

### B. EXPÉRIENCES PROFESSIONNELLES — LISTE FIXE
${immutableExperiences}

Pour chaque expérience tu peux :
  ✅ Réécrire la description / les bullets
  ✅ Réordonner les expériences

Tu NE peux PAS :
  ❌ Changer le nom de l'entreprise, l'intitulé du poste, ou les dates
  ❌ Ajouter ou supprimer une expérience

### C. FORMATIONS — LISTE FIXE (totalement immutable)
${immutableEducation}

Tu NE peux RIEN modifier dans les formations : ni le diplôme, ni l'établissement, ni les dates.

### D. CE QUE TU PEUX RÉELLEMENT FAIRE
  ✅ Réécrire le **résumé / profil professionnel**
  ✅ Réécrire le **titre du poste visé** affiché sous le nom
  ✅ Réécrire les **bullets d'expérience** avec verbes d'action + quantification
  ✅ **Réordonner** par pertinence
  ✅ **Ajouter des compétences techniques** UNIQUEMENT si plausibles vu son parcours

### E. INTERDICTIONS ABSOLUES (= MENSONGE)
  ❌ Inventer un poste, employeur, mission, diplôme, école, certification, langue
  ❌ Modifier nom, email, téléphone ou ville
  ❌ Ajouter des compétences sans lien avec le parcours réel

Si une info manque dans le CV original, OMETS-LA ou écris "Non renseigné". N'INVENTE JAMAIS.

## MISSION
Optimise le CV ci-dessous pour maximiser les chances de passer les filtres ATS et impressionner les recruteurs humains,
en respectant strictement les règles A-E ci-dessus.

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
7. **Formatage ATS-safe** : AUCUN tableau HTML, AUCUNE image, AUCUN SVG, AUCUN élément graphique complexe. Le seul "display:flex" autorisé est celui utilisé dans le template ci-dessous (titre/dates d'expérience) — c'est un pattern standard 2026 lu correctement par tous les ATS modernes.
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

## RÈGLES HTML — CRITIQUES POUR LE PARSING JSON
- **OBLIGATOIRE** : Utilise UNIQUEMENT des single quotes (') pour TOUS les attributs HTML
  → Exemple : <div style='color: #1e293b'> ET NON <div style="color: #1e293b">
  → Pourquoi : le HTML est embarqué dans une string JSON (double quotes), donc utiliser des
     double quotes en HTML casse le JSON.
- Pas de retour à la ligne dans les valeurs JSON (un seul long HTML sur une ligne logique).

## TEMPLATE HTML À SUIVRE STRICTEMENT (ATS-OPTIMISÉ)
Tu DOIS reproduire EXACTEMENT cette structure, en remplaçant uniquement les contenus textuels.
Ne modifie PAS les styles, les couleurs, les balises ou la hiérarchie.

**Pourquoi cette structure est ATS-safe :**
- Header en colonne unique → les vieux ATS lisent le nom et les contacts dans le bon ordre
- Contact info séparée par " · " (texte réel) → l'ATS sépare correctement email/tel/ville
- Pills en inline-block → l'espace HTML naturel entre les spans = séparateur ATS

\`\`\`html
<div style='max-width:820px;margin:0 auto;padding:48px 56px;background:#ffffff;font-family:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;color:#1e293b;font-size:13px;line-height:1.6'>

  <!-- HEADER : single-column, max compatibilité ATS -->
  <header style='border-bottom:3px solid #590293;padding-bottom:18px;margin-bottom:28px'>
    <h1 style='margin:0;font-size:32px;font-weight:700;color:#0f172a;letter-spacing:-0.5px'>PRÉNOM NOM</h1>
    <p style='margin:6px 0 10px;font-size:15px;color:#590293;font-weight:600'>Titre du poste visé</p>
    <p style='margin:0;font-size:12px;color:#475569'>email@exemple.com · +33 X XX XX XX XX · Ville, Pays · linkedin.com/in/profil</p>
  </header>

  <!-- RÉSUMÉ PROFESSIONNEL -->
  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 10px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Profil professionnel</h2>
    <p style='margin:0;color:#334155'>2-3 phrases percutantes qui résument l'expertise, l'objectif et la valeur ajoutée du candidat.</p>
  </section>

  <!-- EXPÉRIENCE — titre+dates en flex (standard moderne, OK ATS), reste single-col -->
  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 14px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Expérience professionnelle</h2>

    <div style='margin-bottom:18px'>
      <div style='display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px'>
        <span style='font-size:14px;font-weight:700;color:#0f172a'>Intitulé du poste</span>
        <span style='font-size:12px;color:#64748b;font-weight:500'>Janvier 2023 — Présent</span>
      </div>
      <div style='font-size:13px;color:#590293;font-weight:600;margin-bottom:8px'>Nom de l'entreprise · Ville</div>
      <ul style='margin:0;padding-left:18px;color:#334155'>
        <li style='margin-bottom:4px'>Verbe d'action au passé + description quantifiée (+X%, X projets)…</li>
        <li style='margin-bottom:4px'>Verbe d'action au passé + résultat concret…</li>
        <li style='margin-bottom:4px'>Verbe d'action au passé + impact mesurable…</li>
      </ul>
    </div>

    <!-- Répéter le bloc ci-dessus pour chaque expérience -->
  </section>

  <!-- FORMATION -->
  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 14px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Formation</h2>
    <div style='margin-bottom:12px'>
      <div style='display:flex;justify-content:space-between;align-items:baseline'>
        <span style='font-size:14px;font-weight:700;color:#0f172a'>Diplôme</span>
        <span style='font-size:12px;color:#64748b;font-weight:500'>2020 — 2023</span>
      </div>
      <div style='font-size:13px;color:#475569;margin-top:2px'>Établissement · Ville</div>
    </div>
  </section>

  <!-- COMPÉTENCES — pills en inline-block (espace HTML naturel = séparateur ATS) -->
  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 12px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Compétences techniques</h2>
    <div>
      <span style='display:inline-block;background:#f3e8ff;color:#590293;font-size:12px;font-weight:600;padding:5px 12px;border-radius:999px;margin:0 4px 6px 0'>React</span>
      <span style='display:inline-block;background:#f3e8ff;color:#590293;font-size:12px;font-weight:600;padding:5px 12px;border-radius:999px;margin:0 4px 6px 0'>TypeScript</span>
      <!-- Répéter pour chaque compétence. Garde l'espace/newline naturel entre les balises pour l'ATS. -->
    </div>
  </section>

  <!-- LANGUES — ligne inline avec séparateur texte "·" (ATS-friendly) -->
  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 10px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Langues</h2>
    <p style='margin:0;color:#334155'><strong style='color:#0f172a'>Français</strong> — Natif · <strong style='color:#0f172a'>Anglais</strong> — Courant (C1)</p>
  </section>

  <!-- CENTRES D'INTÉRÊT (optionnel) -->
  <section>
    <h2 style='margin:0 0 10px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Centres d'intérêt</h2>
    <p style='margin:0;color:#334155'>Liste ou phrase courte séparée par " · ", 3-5 items max.</p>
  </section>

</div>
\`\`\`

## RÈGLES DE REMPLISSAGE
- Si une section n'a pas de données pertinentes pour ce candidat, OMETS-LA entièrement plutôt que de la laisser vide.
- Adapte le titre sous le nom à l'objectif réel du candidat ("Développeuse Full-Stack & AI Engineer", "Chef de projet digital", etc).
- Pour les compétences : 8-20 pills max, les plus pertinentes en premier.
- Les bullets d'expérience commencent TOUJOURS par un verbe d'action au passé.
- Le résumé professionnel doit faire 2-3 phrases, pas plus.
- Le HTML retourné doit être SUR UNE SEULE LIGNE LOGIQUE (pas de \\n entre les balises) pour minimiser les problèmes d'échappement JSON.`;
}
