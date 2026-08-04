import type { Profile } from '@prisma/client'
import { extractImmutableContact, formatImmutableEducation, formatImmutableExperiences } from './cvImmutable.js'

/** Structures raw PDF text into JSON — must never invent data absent from the source text. */
export function buildExtractionPrompt(rawText: string): string {
  return `Tu es un extracteur de CV. Voici le texte brut extrait d'un fichier PDF par un outil de parsing (la mise en page d'origine est perdue, seul le texte demeure).

## MISSION
Structure ce texte en JSON, SANS reformuler, SANS résumer, SANS inventer. Tu es un extracteur, pas un rédacteur.

## RÈGLES
- N'invente AUCUNE information absente du texte. Si un champ est introuvable, mets \`null\` (ou un tableau vide pour les listes).
- Recopie les informations telles quelles (dates, intitulés, noms d'entreprises/écoles) — ne les traduis pas, ne les reformule pas.
- Le champ "summary" est le seul où tu peux légèrement condenser un paragraphe d'accroche déjà présent dans le texte (jamais en inventer un s'il n'existe pas).

## TEXTE DU CV
${rawText.slice(0, 12000)}

## FORMAT DE SORTIE
Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks) :
{
  "fullName": "string ou null",
  "email": "string ou null",
  "phone": "string ou null",
  "location": "string ou null",
  "linkedin": "string ou null",
  "professionalTitle": "string ou null",
  "summary": "string ou null",
  "experiences": [
    { "title": "string", "company": "string", "startDate": "string", "endDate": "string", "description": "string" }
  ],
  "education": [
    { "degree": "string", "school": "string", "startDate": "string", "endDate": "string" }
  ],
  "skills": ["string"]
}`
}

const OBJECTIVE_LABELS: Record<string, string> = {
  FIND_JOB: 'Trouver un emploi',
  IMPROVE_CV: 'Améliorer mon CV',
  CAREER_CHANGE: 'Changer de carrière',
  DEVELOP_SKILLS: 'Développer mes compétences',
  NETWORK: 'Développer mon réseau',
}

const SITUATION_LABELS: Record<string, string> = {
  EMPLOYED: 'En poste',
  JOB_SEARCH: 'En recherche d’emploi',
  RECONVERSION: 'En reconversion',
  STUDENT: 'Étudiant',
}

/** Rewrites the CV for ATS compatibility while forbidding invention of facts (contact, experiences, education). */
export function buildOptimizationPrompt(profile: Profile | null, extractedData: any): string {
  const immutable = extractImmutableContact(extractedData, profile)
  const immutableExperiences = formatImmutableExperiences(extractedData)
  const immutableEducation = formatImmutableEducation(extractedData)

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
- LinkedIn     : "${immutable.linkedin ?? '(NON RENSEIGNÉ — laisse vide)'}"

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
- Nom : ${profile?.firstName || 'Non renseigné'} ${profile?.lastName || ''}
- Niveau d'études : ${profile?.educationLevel || 'Non renseigné'}
- Secteur visé : ${profile?.sector || 'Non renseigné'}
- Statut actuel : ${(profile?.situation && SITUATION_LABELS[profile.situation]) || 'Non renseigné'}
- Objectif principal : ${(profile?.objective && OBJECTIVE_LABELS[profile.objective]) || 'Non défini'}
- Forces : ${JSON.stringify(profile?.strengths || [])}
- Points à travailler : ${JSON.stringify(profile?.improvements || [])}
- Compétences : ${JSON.stringify(profile?.skills || [])}
- Bio : ${profile?.bio || 'Non renseignée'}

## DONNÉES CV EXTRAITES
${JSON.stringify(extractedData, null, 2)}

## RÈGLES D'OPTIMISATION ATS
1. **Structure ATS-compatible** : titres de section standards (Profil Professionnel, Expérience Professionnelle, Formation, Compétences Techniques, Langues, Centres d'intérêt)
2. **Mots-clés sectoriels** : mots-clés pertinents pour le secteur "${profile?.sector || 'général'}"
3. **Bullet points actionnables** : 3-5 bullets par expérience, verbe d'action au passé (Développé, Géré, Optimisé, Coordonné, Mis en place...)
4. **Quantification des résultats** : métriques plausibles (+X%, X projets, X personnes managées...)
5. **Résumé professionnel** : 2-3 lignes percutantes, alignées avec l'objectif "${(profile?.objective && OBJECTIVE_LABELS[profile.objective]) || 'professionnel'}"
6. **Compétences organisées** : catégories claires (Techniques, Soft Skills, Outils & Logiciels)
7. **Formatage ATS-safe** : AUCUN tableau HTML, AUCUNE image, AUCUN SVG. Le seul "display:flex" autorisé est celui du template (titre/dates d'expérience).
8. **Longueur** : 1-2 pages imprimables
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
"structure" (réorganisation), "keywords" (mots-clés ATS), "content" (réécriture), "formatting" (mise en forme), "skills" (compétences), "profile" (résumé professionnel)

## IMPACT LEVELS
"high" (critique pour le passage ATS), "medium" (amélioration significative), "low" (ajustement mineur)

## RÈGLES HTML — CRITIQUES POUR LE PARSING JSON
- **OBLIGATOIRE** : Utilise UNIQUEMENT des single quotes (') pour TOUS les attributs HTML (le HTML est embarqué dans une string JSON en double quotes)
- Pas de retour à la ligne dans les valeurs JSON (un seul long HTML sur une ligne logique)

## TEMPLATE HTML À SUIVRE STRICTEMENT (ATS-OPTIMISÉ)
Reproduis EXACTEMENT cette structure, en remplaçant uniquement les contenus textuels. Ne modifie pas les styles, couleurs, balises ou hiérarchie.

\`\`\`html
<div style='max-width:820px;margin:0 auto;padding:48px 56px;background:#ffffff;font-family:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;color:#1e293b;font-size:13px;line-height:1.6'>
  <header style='border-bottom:3px solid #590293;padding-bottom:18px;margin-bottom:28px'>
    <h1 style='margin:0;font-size:32px;font-weight:700;color:#0f172a;letter-spacing:-0.5px'>PRÉNOM NOM</h1>
    <p style='margin:6px 0 10px;font-size:15px;color:#590293;font-weight:600'>Titre du poste visé</p>
    <p style='margin:0;font-size:12px;color:#475569'>email@exemple.com · +33 X XX XX XX XX · Ville, Pays · linkedin.com/in/profil</p>
  </header>
  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 10px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Profil professionnel</h2>
    <p style='margin:0;color:#334155'>2-3 phrases percutantes qui résument l'expertise, l'objectif et la valeur ajoutée du candidat.</p>
  </section>
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
      </ul>
    </div>
    <!-- Répéter le bloc ci-dessus pour chaque expérience -->
  </section>
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
  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 12px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Compétences techniques</h2>
    <div>
      <span style='display:inline-block;background:#f3e8ff;color:#590293;font-size:12px;font-weight:600;padding:5px 12px;border-radius:999px;margin:0 4px 6px 0'>React</span>
      <!-- Répéter pour chaque compétence -->
    </div>
  </section>
  <section style='margin-bottom:28px'>
    <h2 style='margin:0 0 10px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Langues</h2>
    <p style='margin:0;color:#334155'><strong style='color:#0f172a'>Français</strong> — Natif</p>
  </section>
  <section>
    <h2 style='margin:0 0 10px;font-size:11px;font-weight:700;color:#590293;text-transform:uppercase;letter-spacing:2px'>Centres d'intérêt</h2>
    <p style='margin:0;color:#334155'>Liste ou phrase courte séparée par " · ", 3-5 items max.</p>
  </section>
</div>
\`\`\`

## RÈGLES DE REMPLISSAGE
- Si une section n'a pas de données pertinentes, OMETS-LA entièrement.
- Adapte le titre sous le nom à l'objectif réel du candidat.
- 8-20 pills max pour les compétences, les plus pertinentes en premier.
- Les bullets d'expérience commencent TOUJOURS par un verbe d'action au passé.
- Le résumé professionnel doit faire 2-3 phrases, pas plus.
- Le HTML retourné doit être SUR UNE SEULE LIGNE LOGIQUE.`
}
