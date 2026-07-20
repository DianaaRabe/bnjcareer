import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callLLM, extractCVOptimization, LLMError } from "@/lib/llm/client";
import {
  extractImmutableContact,
  formatImmutableExperiences,
  formatImmutableEducation,
  formatCvExtras,
} from "@/lib/cv/immutable";

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

    // ── Call LLM via centralized wrapper (with fallback chain) ──────────
    let optimizedHtml = "";
    let improvements: any[] = [];
    let matchSummary = "";

    try {
      const { content: rawContent, model } = await callLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              "Optimise ce CV pour ce poste spécifique maintenant. Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte avant ou après.",
          },
        ],
        temperature: 0.3,
        maxTokens: 4500,
        jsonMode: true,
        referer: req.headers.get("origin") || undefined,
      });
      console.log(`[cv-optimize-job] LLM used: ${model}`);

      const parsed = extractCVOptimization(rawContent);
      optimizedHtml = parsed.optimized_html;
      improvements = parsed.improvements;
      matchSummary = parsed.match_summary || "";
    } catch (err) {
      if (err instanceof LLMError) {
        console.error("[cv-optimize-job] All LLM models failed:", err.attempts);
        await admin.from("job_cv_versions").update({ status: "failed" }).eq("id", versionRecord.id);
        return NextResponse.json({ error: "AI optimization failed" }, { status: 502 });
      }
      console.error("[cv-optimize-job] JSON parse error:", err);
      await admin.from("job_cv_versions").update({ status: "failed" }).eq("id", versionRecord.id);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
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

  const immutable = extractImmutableContact(cvData, profile);
  const immutableExperiences = formatImmutableExperiences(cvData);
  const immutableEducation   = formatImmutableEducation(cvData);
  const cvExtras             = formatCvExtras(cvData);

  return `Tu es un expert senior en rédaction de CV, spécialisé dans l'optimisation ciblée pour des postes spécifiques.
Tu as 15 ans d'expérience en recrutement et tu connais parfaitement les algorithmes ATS et les attentes des recruteurs.

## ⚠️⚠️⚠️ RÈGLES INVIOLABLES — LIS ET RESPECTE CETTE SECTION AVANT TOUT ⚠️⚠️⚠️

Ton rôle est de **reformuler** et **réorganiser** le CV pour l'aligner avec un poste cible.
Tu n'es PAS rédacteur fiction. Tu NE peux PAS inventer, embellir ou fabriquer des faits.

### A. INFORMATIONS DE CONTACT — RECOPIE-LES VERBATIM, NE LES MODIFIE JAMAIS
- Nom complet  : "${immutable.name ?? "(NON RENSEIGNÉ — écris 'Non renseigné' et NE TROUVE PAS de nom à la place)"}"
- Email        : "${immutable.email ?? "(NON RENSEIGNÉ — écris 'Non renseigné' et NE FABRIQUE PAS d'email)"}"
- Téléphone    : "${immutable.phone ?? "(NON RENSEIGNÉ — écris 'Non renseigné' et NE FABRIQUE PAS de numéro)"}"
- Localisation : "${immutable.location ?? "(NON RENSEIGNÉ — écris 'Non renseigné' et NE FABRIQUE PAS de ville)"}"
- LinkedIn     : "${immutable.linkedin ?? "(NON RENSEIGNÉ — laisse vide)"}"

🚨 INTERDICTION FORMELLE : ne change PAS la ville du candidat pour qu'elle corresponde à la ville du poste.
   Si le candidat habite à "Antananarivo, Madagascar" et postule à Paris, son CV doit dire "Antananarivo, Madagascar".
   C'est au recruteur de décider s'il accepte les candidats à distance.

### B. EXPÉRIENCES PROFESSIONNELLES — LISTE FIXE
Voici la liste EXACTE des expériences du candidat (tu n'en ajoutes pas, tu n'en supprimes pas) :
${immutableExperiences}

Pour chaque expérience tu peux :
  ✅ Réécrire la description / les bullets pour faire ressortir la pertinence avec le poste cible
  ✅ Réordonner les bullets, les regrouper
  ✅ Réordonner les expériences entre elles (la plus pertinente en premier)

Tu NE peux PAS :
  ❌ Changer le nom de l'entreprise
  ❌ Changer l'intitulé du poste qui a été occupé
  ❌ Changer les dates
  ❌ Ajouter une expérience qui n'est pas dans la liste ci-dessus
  ❌ Supprimer une expérience

### C. FORMATIONS — LISTE FIXE (totalement immutable)
${immutableEducation}

Tu NE peux RIEN modifier dans les formations : ni le diplôme, ni l'établissement, ni les dates.
Tu peux uniquement les réordonner.

### D. CE QUE TU PEUX RÉELLEMENT FAIRE
  ✅ Réécrire complètement le **résumé / profil professionnel** (2-3 phrases qui ciblent le poste)
  ✅ Réécrire le **titre du poste visé** affiché sous le nom (ex: "Développeuse Full-Stack" → "Développeuse Full-Stack & AI Engineer")
  ✅ Réécrire les **bullets d'expérience** avec des verbes d'action + mots-clés du poste
  ✅ **Réordonner** les expériences et les compétences pour mettre les plus pertinentes en haut
  ✅ **Ajouter des compétences techniques** UNIQUEMENT si elles sont raisonnablement plausibles vu son parcours
      (ex: s'il a React dans son CV, tu peux ajouter "Next.js" ou "React Hooks". Mais pas "Kubernetes" si rien dans son CV n'y fait référence.)

### E. INTERDICTIONS ABSOLUES (= MENSONGE = CV ÉLIMINÉ EN ENTRETIEN)
  ❌ Inventer un poste, un employeur, une mission qui n'existe pas
  ❌ Inventer un diplôme, une école, une certification
  ❌ Inventer une langue parlée
  ❌ Ajouter des compétences sans aucun lien avec le parcours réel
  ❌ Modifier le nom, l'email, le téléphone ou la ville
  ❌ Changer la ville pour qu'elle matche celle du poste

Si une info manque dans le CV original, OMETS-LA ou écris "Non renseigné". N'INVENTE JAMAIS.

## MISSION
Adapte le CV ci-dessous pour MAXIMISER les chances d'être sélectionné pour ce poste SPÉCIFIQUE,
en respectant strictement les règles A-E ci-dessus.

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

## DONNÉES CV EXISTANT (extras — le contact, les expériences et les formations figurent déjà dans les sections A/B/C)
${cvExtras}

## STRATÉGIE D'OPTIMISATION POUR CE POSTE

### 1. Alignement des mots-clés
- Identifie TOUS les mots-clés importants de l'offre (hard skills, soft skills, outils, méthodologies)
- Intègre-les naturellement dans le CV aux endroits pertinents
- Utilise les MÊMES TERMES que l'offre (pas de synonymes quand le mot exact est important)

### 2. Réorganisation stratégique
- Place en premier les expériences les plus pertinentes pour ce poste
- Mets en avant les compétences qui matchent directement avec les exigences
- Ajuste le résumé professionnel pour cibler spécifiquement ce poste

### 3. Comblement des lacunes (dans le respect strict des règles A-E)
- Si le candidat a des compétences transférables qui couvrent un gap, mets-les en avant
- Reformule les expériences existantes pour faire ressortir la pertinence
- Ajoute des compétences techniques plausibles vu son parcours (voir règle D)

### 4. Optimisation ATS ciblée
- Structure avec des sections standards (Profil, Expérience, Formation, Compétences)
- Bullet points commençant par des verbes d'action pertinents pour ce domaine
- Quantification des résultats quand c'est plausible
- Format ATS-safe : AUCUN tableau HTML, AUCUNE image, AUCUN SVG. Le seul "display:flex" autorisé est celui utilisé dans le template ci-dessous (titre/dates d'expérience) — pattern standard 2026 lu correctement par tous les ATS modernes.

## RAPPEL : RELIS LA SECTION "⚠️⚠️⚠️ RÈGLES INVIOLABLES" CI-DESSUS AVANT DE GÉNÉRER LA RÉPONSE
Les infos de contact, expériences et formations DOIVENT correspondre exactement à celles listées dans la section A/B/C ci-dessus. Toute déviation = mensonge.

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

## RÈGLES HTML — CRITIQUES POUR LE PARSING JSON
- **OBLIGATOIRE** : Utilise UNIQUEMENT des single quotes (') pour TOUS les attributs HTML
  → Exemple : <div style='color: #1e293b'> ET NON <div style="color: #1e293b">
- Pas de retour à la ligne dans les valeurs JSON.

## TEMPLATE HTML À SUIVRE STRICTEMENT (ATS-OPTIMISÉ)
Tu DOIS reproduire EXACTEMENT cette structure, en remplaçant uniquement les contenus textuels.

**Pourquoi cette structure est ATS-safe :**
- Header single-column → lecture nom+contact dans le bon ordre même par vieux ATS
- Contact info séparée par " · " (texte réel) → email/tel/ville parsés correctement
- Pills en inline-block → l'espace HTML naturel = séparateur de skills pour l'ATS

\`\`\`html
<div style='max-width:820px;margin:0 auto;padding:48px 56px;background:#ffffff;font-family:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;color:#1e293b;font-size:13px;line-height:1.6'>

  <header style='border-bottom:3px solid #590293;padding-bottom:18px;margin-bottom:28px'>
    <h1 style='margin:0;font-size:32px;font-weight:700;color:#0f172a;letter-spacing:-0.5px'>PRÉNOM NOM</h1>
    <p style='margin:6px 0 10px;font-size:15px;color:#590293;font-weight:600'>Titre aligné avec le poste visé</p>
    <p style='margin:0;font-size:12px;color:#475569'>email@exemple.com · +33 X XX XX XX XX · Ville, Pays · linkedin.com/in/profil</p>
  </header>

  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 10px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Profil professionnel</h2>
    <p style='margin:0;color:#334155'>2-3 phrases alignées avec les exigences du poste cible.</p>
  </section>

  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 14px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Expérience professionnelle</h2>
    <div style='margin-bottom:18px'>
      <div style='display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px'>
        <span style='font-size:14px;font-weight:700;color:#0f172a'>Intitulé du poste</span>
        <span style='font-size:12px;color:#64748b;font-weight:500'>Janvier 2023 — Présent</span>
      </div>
      <div style='font-size:13px;color:#590293;font-weight:600;margin-bottom:8px'>Entreprise · Ville</div>
      <ul style='margin:0;padding-left:18px;color:#334155'>
        <li style='margin-bottom:4px'>Bullet réécrit pour faire écho au job ciblé, avec verbe d'action + métrique.</li>
        <li style='margin-bottom:4px'>Bullet mettant en avant des compétences explicitement demandées dans l'offre.</li>
      </ul>
    </div>
  </section>

  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 14px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Formation</h2>
    <div>
      <div style='display:flex;justify-content:space-between;align-items:baseline'>
        <span style='font-size:14px;font-weight:700;color:#0f172a'>Diplôme</span>
        <span style='font-size:12px;color:#64748b;font-weight:500'>2020 — 2023</span>
      </div>
      <div style='font-size:13px;color:#475569;margin-top:2px'>Établissement · Ville</div>
    </div>
  </section>

  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 12px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Compétences techniques</h2>
    <div>
      <span style='display:inline-block;background:#f3e8ff;color:#590293;font-size:12px;font-weight:600;padding:5px 12px;border-radius:999px;margin:0 4px 6px 0'>Skill 1</span>
      <span style='display:inline-block;background:#f3e8ff;color:#590293;font-size:12px;font-weight:600;padding:5px 12px;border-radius:999px;margin:0 4px 6px 0'>Skill 2</span>
      <!-- Garde l'espace/newline naturel entre les balises pour l'ATS. -->
    </div>
  </section>

  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 10px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Langues</h2>
    <p style='margin:0;color:#334155'><strong style='color:#0f172a'>Français</strong> — Natif</p>
  </section>

</div>
\`\`\`

## RÈGLES DE REMPLISSAGE
- Priorise les compétences et expériences pertinentes pour CE poste spécifique en haut de chaque section.
- Le titre sous le nom doit refléter le poste ciblé.
- Réécris les bullets d'expérience pour matcher le vocabulaire de l'offre (mots-clés ATS).
- Omets les sections sans données pertinentes.
- Le HTML retourné doit être SUR UNE SEULE LIGNE LOGIQUE.`;
}
