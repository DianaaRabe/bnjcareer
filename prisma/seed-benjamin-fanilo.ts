/**
 * Seed ciblé — Benjamin Parienty (coach) & Fanilo Rabemanantsoa (candidat)
 *
 * ✅ Idempotent : si les comptes existent déjà (vrais comptes prod), le script
 *    récupère leur UUID et se contente d'ajouter formations, sessions et inscriptions.
 *
 * Usage :
 *   npx ts-node --project tsconfig.seed.json prisma/seed-benjamin-fanilo.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ogwrtegpknihxixgptqe.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3J0ZWdwa25paHhpeGdwdHFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc0MzE0NiwiZXhwIjoyMDkxMzE5MTQ2fQ.Qe52dmgdVa_XXip5xC7NxSqFnAwgWTJzZNvs6CB8EaY";

// ⚠️  Emails des vrais comptes — modifie si différents
const BENJAMIN_EMAIL = "site.benjaminparienty@gmail.com";
const FANILO_EMAIL   = "fanilo@bnjteammaker.fr";
const DEFAULT_PASSWORD = "Test1234!";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── helpers ───────────────────────────────────────────────────────────────────
async function upsertUser(email: string, password: string, meta: object): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: meta,
  });
  if (error) {
    if (error.message.includes("already been registered")) {
      const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
      const existing = list?.users.find((u) => u.email === email);
      if (existing) { warn(`Compte existant réutilisé : ${email} → ${existing.id.slice(0,8)}...`); return existing.id; }
      throw new Error(`Impossible de récupérer : ${email}`);
    }
    throw error;
  }
  return data.user!.id;
}

function daysAgo(n: number, hour = 10): string {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(hour, 0, 0, 0); return d.toISOString();
}
function daysFromNow(n: number, hour = 10): string {
  const d = new Date(); d.setDate(d.getDate() + n); d.setHours(hour, 0, 0, 0); return d.toISOString();
}

const log  = (m: string) => console.log(`\x1b[36m▸\x1b[0m ${m}`);
const ok   = (m: string) => console.log(`\x1b[32m✓\x1b[0m ${m}`);
const warn = (m: string) => console.log(`\x1b[33m⚠\x1b[0m ${m}`);
const sec  = (m: string) => console.log(`\n\x1b[35m━━ ${m} ━━\x1b[0m`);

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🌱 \x1b[1mSeed ciblé — Benjamin & Fanilo\x1b[0m\n");

  // ══════════════════════════════════════════════════════════════════════════
  // 1. Benjamin Parienty — Coach
  // ══════════════════════════════════════════════════════════════════════════
  sec("Benjamin Parienty — Coach");
  log(`Email : ${BENJAMIN_EMAIL}`);

  const benjaminId = await upsertUser(BENJAMIN_EMAIL, DEFAULT_PASSWORD, {
    first_name: "Benjamin", last_name: "Parienty",
  });

  await supabase.from("profiles").upsert({
    id: benjaminId,
    first_name: "Benjamin",
    last_name: "Parienty",
    bio: "Fondateur de BNJ Skills Maker. Coach certifié en stratégie de carrière, entrepreneuriat et personal branding. J'ai accompagné + de 800 candidats depuis 2018 vers l'emploi ou la création d'entreprise.",
    role: "coach",
    specialization: "Stratégie de carrière & Entrepreneuriat",
    experience_years: 7,
    certifications: ["Coach Professionnel ICF", "Expert Bilan de Compétences", "Formateur certifié QUALIOPI"],
    session_types: ["1v1", "group"],
    support_areas: ["Personal Branding", "Stratégie de carrière", "Entrepreneuriat", "LinkedIn", "Entretiens"],
    is_onboarded: true,
  }, { onConflict: "id" });

  ok(`Benjamin Parienty prêt (${benjaminId.slice(0, 8)}...)`);

  // ── Formations Benjamin ──────────────────────────────────────────────────
  sec("Formations de Benjamin");

  type ModuleDef = {
    title: string; description: string; video_url: string;
    duration_minutes: number; order_index: number;
    exercise_data: { type: string; question: string; options: string[]; correct_answer: string; explanation: string }[];
  };
  type MilestoneDef = { title: string; order_index: number };
  type FormationDef = {
    title: string; description: string; duration_label: string;
    price: number; level: string; category: string;
    is_published: boolean; modules_count: number; max_students: number | null;
    milestones: MilestoneDef[]; modules: ModuleDef[];
  };

  const benjaminFormations: FormationDef[] = [
    // ── Formation 1 : Personal Branding (phare, gratuite)
    {
      title: "Personal Branding : devenez incontournable dans votre domaine",
      description: "Apprenez à construire une marque personnelle forte sur LinkedIn et au-delà pour attirer les opportunités sans prospecter. La méthode BNJ testée sur 800+ candidats.",
      duration_label: "3 semaines", price: 0, level: "débutant",
      category: "Soft Skills", is_published: true, modules_count: 5, max_students: null,
      milestones: [
        { title: "Positionnement unique défini", order_index: 0 },
        { title: "Profil LinkedIn score 90+", order_index: 1 },
        { title: "Premier post viral publié", order_index: 2 },
      ],
      modules: [
        { title: "Qu'est-ce que le Personal Branding (et pourquoi ça change tout)", description: "Définition, exemples concrets et pourquoi c'est devenu indispensable en 2026.", video_url: "https://youtube.com/watch?v=bnj-pb-1", duration_minutes: 18, order_index: 0, exercise_data: [{ type: "open", question: "En une phrase, quelle est votre promesse de valeur unique ?", options: [], correct_answer: "", explanation: "" }] },
        { title: "Trouver votre positionnement unique — La méthode Ikigai Pro", description: "Intersection entre vos compétences, vos passions, le besoin du marché et votre ADN.", video_url: "https://youtube.com/watch?v=bnj-pb-2", duration_minutes: 35, order_index: 1, exercise_data: [{ type: "qcm", question: "Le concept Ikigai vient de :", options: ["Chine", "Corée", "Japon", "Thaïlande"], correct_answer: "Japon", explanation: "Ikigai est un concept japonais signifiant «raison d'être»." }] },
        { title: "Optimiser votre profil LinkedIn de A à Z", description: "Photo, titre accrocheur, résumé magnétique, expériences et recommandations.", video_url: "https://youtube.com/watch?v=bnj-pb-3", duration_minutes: 40, order_index: 2, exercise_data: [{ type: "open", question: "Réécrivez votre titre LinkedIn en moins de 120 caractères pour attirer votre client/recruteur idéal.", options: [], correct_answer: "", explanation: "" }] },
        { title: "Créer du contenu qui engage — La méthode des 3E", description: "Éduquer, Engager, Émouvoir. Formats qui fonctionnent, hooks efficaces et calendrier éditorial.", video_url: "https://youtube.com/watch?v=bnj-pb-4", duration_minutes: 30, order_index: 3, exercise_data: [{ type: "qcm", question: "Quelle heure est généralement la plus efficace pour publier sur LinkedIn (France) ?", options: ["6h-7h", "7h30-9h", "12h-13h", "20h-21h"], correct_answer: "7h30-9h", explanation: "Les publications LinkedIn en semaine entre 7h30 et 9h obtiennent en moyenne 25% plus d'impressions." }] },
        { title: "Mesurer et amplifier votre impact", description: "KPIs LinkedIn, outils de suivi et stratégie pour passer de 500 à 5000 abonnés qualifiés.", video_url: "https://youtube.com/watch?v=bnj-pb-5", duration_minutes: 22, order_index: 4, exercise_data: [] },
      ],
    },

    // ── Formation 2 : Stratégie de carrière (premium)
    {
      title: "Stratégie de carrière 360° — Trouver sa voie et avancer vite",
      description: "Un programme complet pour clarifier votre direction, accélérer votre évolution et éviter les erreurs qui coûtent des années. CV, entretiens, réseau, négociation : tout y est.",
      duration_label: "6 semaines", price: 69, level: "intermédiaire",
      category: "Entretien", is_published: true, modules_count: 6, max_students: null,
      milestones: [
        { title: "Bilan de compétences personnel complété", order_index: 0 },
        { title: "CV version 2.0 validé", order_index: 1 },
        { title: "Stratégie réseau activée", order_index: 2 },
        { title: "Offre d'emploi obtenue ou promotion décidée", order_index: 3 },
      ],
      modules: [
        { title: "Bilan express — Qui suis-je, où vais-je ?", description: "Forces, valeurs, freins, moteurs. Le bilan de carrière condensé en 1 module.", video_url: "https://youtube.com/watch?v=bnj-sc-1", duration_minutes: 55, order_index: 0, exercise_data: [{ type: "open", question: "Décrivez votre situation idéale dans 3 ans (poste, environnement, équilibre vie pro/perso).", options: [], correct_answer: "", explanation: "" }] },
        { title: "CV de cadre 2026 — Ce qui a changé", description: "ATS, design, longueur, mots-clés et les nouvelles attentes des recruteurs.", video_url: "https://youtube.com/watch?v=bnj-sc-2", duration_minutes: 38, order_index: 1, exercise_data: [{ type: "qcm", question: "Quelle est la longueur idéale d'un CV pour un cadre avec 5+ ans d'expérience ?", options: ["1 page max", "2 pages", "3 pages", "Peu importe"], correct_answer: "2 pages", explanation: "Pour un cadre expérimenté, 2 pages permet de valoriser toutes les expériences pertinentes sans noyer le recruteur." }] },
        { title: "Activer son réseau sans paraître intéressé", description: "Scripts de prise de contact, informational interviews et LinkedIn Networking.", video_url: "https://youtube.com/watch?v=bnj-sc-3", duration_minutes: 32, order_index: 2, exercise_data: [] },
        { title: "Maîtriser les entretiens — De la convocation à l'offre", description: "Préparation, méthode STAR, questions pièges, gestion du stress.", video_url: "https://youtube.com/watch?v=bnj-sc-4", duration_minutes: 50, order_index: 3, exercise_data: [{ type: "qcm", question: "En entretien, quand faut-il parler en premier de ses prétentions salariales ?", options: ["Dès le début", "Après avoir valorisé votre profil", "Jamais — attendre que le recruteur aborde le sujet", "En fin d'entretien seulement si demandé"], correct_answer: "Après avoir valorisé votre profil", explanation: "Il faut d'abord créer de la valeur perçue avant de parler salaire, sinon vous négociez en position de faiblesse." }] },
        { title: "Négociation salariale — La méthode BNJ en 5 étapes", description: "Benchmarks, ancrage, silence, contreparties et comment obtenir 15 à 25% de plus.", video_url: "https://youtube.com/watch?v=bnj-sc-5", duration_minutes: 42, order_index: 4, exercise_data: [{ type: "open", question: "Écrivez votre script d'ouverture de négociation salariale pour votre prochain poste visé.", options: [], correct_answer: "", explanation: "" }] },
        { title: "Prise de poste réussie — Les 90 premiers jours", description: "Comment s'imposer rapidement, créer des alliances et livrer des quick wins.", video_url: "https://youtube.com/watch?v=bnj-sc-6", duration_minutes: 28, order_index: 5, exercise_data: [] },
      ],
    },

    // ── Formation 3 : Entrepreneuriat (avancée, payante)
    {
      title: "De salarié à entrepreneur — Lancer son activité sans filet",
      description: "Le chemin complet pour passer du projet à la première vente en moins de 90 jours : positionnement, offre, acquisition clients et gestion administrative.",
      duration_label: "8 semaines", price: 99, level: "avancé",
      category: "Reconversion", is_published: true, modules_count: 7, max_students: null,
      milestones: [
        { title: "Concept validé par 10 prospects", order_index: 0 },
        { title: "Statut juridique choisi et démarches lancées", order_index: 1 },
        { title: "Première offre packagée créée", order_index: 2 },
        { title: "Premier client signé", order_index: 3 },
      ],
      modules: [
        { title: "Valider son idée avant de quitter son emploi", description: "Customer discovery, MVP et les 5 questions à poser avant de lancer.", video_url: "https://youtube.com/watch?v=bnj-ent-1", duration_minutes: 40, order_index: 0, exercise_data: [{ type: "qcm", question: "Qu'est-ce qu'un MVP ?", options: ["Most Valuable Professional", "Minimum Viable Product", "Market Validation Process", "Most Visible Profile"], correct_answer: "Minimum Viable Product", explanation: "MVP = version minimale d'un produit qui permet de tester une hypothèse avec de vrais utilisateurs." }] },
        { title: "Choisir son statut juridique (micro, SASU, EURL…)", description: "Comparatif détaillé, fiscalité, protection sociale et conseils selon votre activité.", video_url: "https://youtube.com/watch?v=bnj-ent-2", duration_minutes: 35, order_index: 1, exercise_data: [] },
        { title: "Définir une offre irrésistible et la pricer", description: "Packaging, prix psychologiques, positionnement premium vs mass market.", video_url: "https://youtube.com/watch?v=bnj-ent-3", duration_minutes: 45, order_index: 2, exercise_data: [{ type: "open", question: "Rédigez votre offre principale en 3 lignes : pour qui, quoi, résultat promis.", options: [], correct_answer: "", explanation: "" }] },
        { title: "Trouver ses premiers clients — Sans publicité", description: "Réseau, LinkedIn outreach, bouche-à-oreille et partenariats stratégiques.", video_url: "https://youtube.com/watch?v=bnj-ent-4", duration_minutes: 38, order_index: 3, exercise_data: [] },
        { title: "Créer sa présence en ligne en 1 semaine", description: "Site one-page, profil LinkedIn optimisé entrepreneur, premiers contenus.", video_url: "https://youtube.com/watch?v=bnj-ent-5", duration_minutes: 30, order_index: 4, exercise_data: [] },
        { title: "Gérer sa trésorerie et se payer correctement", description: "Tableau de bord financier simple, TVA, cotisations et épargne de précaution.", video_url: "https://youtube.com/watch?v=bnj-ent-6", duration_minutes: 32, order_index: 5, exercise_data: [{ type: "qcm", question: "Combien de mois de charges fixer comme épargne de précaution idéalement ?", options: ["1 mois", "3 mois", "6 mois", "12 mois"], correct_answer: "6 mois", explanation: "6 mois de charges permettent de traverser les creux d'activité sans stress financier." }] },
        { title: "Scaler : passer de l'auto-emploi à l'entreprise", description: "Déléguer, automatiser, recruter et construire des systèmes qui tournent sans vous.", video_url: "https://youtube.com/watch?v=bnj-ent-7", duration_minutes: 35, order_index: 6, exercise_data: [] },
      ],
    },

    // ── Formation 4 : LinkedIn Avancé (courte, gratuite)
    {
      title: "LinkedIn en 7 jours — De 0 à votre premier lead qualifié",
      description: "Challenge intensif d'une semaine pour créer ou refondre son profil, publier ses 3 premiers posts et obtenir un premier contact qualifié (recruteur ou client).",
      duration_label: "1 semaine", price: 0, level: "débutant",
      category: "Soft Skills", is_published: true, modules_count: 4, max_students: null,
      milestones: [
        { title: "Profil 100% complété", order_index: 0 },
        { title: "3 posts publiés", order_index: 1 },
        { title: "1er lead ou contact recruteur obtenu", order_index: 2 },
      ],
      modules: [
        { title: "Jour 1-2 : Profil béton en 2h chrono", description: "Photo, bannière, titre, résumé et les 3 sections qui font la différence.", video_url: "https://youtube.com/watch?v=bnj-li-1", duration_minutes: 25, order_index: 0, exercise_data: [] },
        { title: "Jour 3-4 : Votre première stratégie de contenu", description: "3 formats pour démarrer (témoignage, conseil, retour d'expérience) et comment les rédiger.", video_url: "https://youtube.com/watch?v=bnj-li-2", duration_minutes: 20, order_index: 1, exercise_data: [{ type: "open", question: "Rédigez votre premier post LinkedIn (200-300 mots) sur une leçon pro apprise cette année.", options: [], correct_answer: "", explanation: "" }] },
        { title: "Jour 5-6 : Networking actif sans être intrusif", description: "Script de prise de contact, profils à cibler et comment convertir une connexion en conversation.", video_url: "https://youtube.com/watch?v=bnj-li-3", duration_minutes: 18, order_index: 2, exercise_data: [] },
        { title: "Jour 7 : Bilan et plan pour les 30 prochains jours", description: "Analyser ses stats, identifier ce qui fonctionne et créer sa routine hebdomadaire.", video_url: "https://youtube.com/watch?v=bnj-li-4", duration_minutes: 15, order_index: 3, exercise_data: [] },
      ],
    },
  ];

  const benjaminFormationIds: string[] = [];
  for (const f of benjaminFormations) {
    log(`Formation : "${f.title}"`);
    const { modules, milestones, ...fData } = f;
    const { data: formation, error: fErr } = await supabase
      .from("formations")
      .insert({ ...fData, coach_id: benjaminId, modules_count: modules.length })
      .select("id").single();
    if (fErr) { console.warn("  ⚠ Erreur formation :", fErr.message); continue; }
    benjaminFormationIds.push(formation.id);

    if (modules.length) await supabase.from("formation_modules").insert(modules.map((m) => ({ ...m, formation_id: formation.id })));
    if (milestones.length) await supabase.from("formation_milestones").insert(milestones.map((ms) => ({ ...ms, formation_id: formation.id })));
    ok(`  "${f.title}" — ${modules.length} modules`);
  }

  // ── Sessions (ateliers) Benjamin ─────────────────────────────────────────
  sec("Sessions / Ateliers de Benjamin");

  const benjaminSessions = [
    // Passées
    { coach_id: benjaminId, title: "Atelier Personal Branding — Groupe A (Avril)", type: "group", start_time: daysAgo(28, 9), end_time: daysAgo(28, 11), max_participants: 12, is_paid: false, price: 0 },
    { coach_id: benjaminId, title: "Session 1-to-1 — Stratégie de carrière", type: "1v1", start_time: daysAgo(21, 14), end_time: daysAgo(21, 15), max_participants: 1, is_paid: true, price: 120 },
    { coach_id: benjaminId, title: "Masterclass LinkedIn (Live) — Groupe Mai", type: "group", start_time: daysAgo(14, 18), end_time: daysAgo(14, 20), max_participants: 50, is_paid: false, price: 0 },
    { coach_id: benjaminId, title: "Atelier CV & Lettre de motivation", type: "group", start_time: daysAgo(7, 10), end_time: daysAgo(7, 12), max_participants: 15, is_paid: false, price: 0 },
    { coach_id: benjaminId, title: "Session 1-to-1 — Bilan de compétences", type: "1v1", start_time: daysAgo(3, 11), end_time: daysAgo(3, 12), max_participants: 1, is_paid: true, price: 120 },
    // À venir
    { coach_id: benjaminId, title: "Atelier Personal Branding — Groupe B (Juin)", type: "group", start_time: daysFromNow(3, 9), end_time: daysFromNow(3, 11), max_participants: 12, is_paid: false, price: 0 },
    { coach_id: benjaminId, title: "Masterclass Entrepreneuriat (Live)", type: "group", start_time: daysFromNow(5, 18), end_time: daysFromNow(5, 20), max_participants: 80, is_paid: true, price: 29 },
    { coach_id: benjaminId, title: "Atelier Stratégie de carrière — Reconversion", type: "group", start_time: daysFromNow(8, 10), end_time: daysFromNow(8, 12), max_participants: 10, is_paid: false, price: 0 },
    { coach_id: benjaminId, title: "Q&A Live — Toutes vos questions carrière", type: "group", start_time: daysFromNow(12, 12), end_time: daysFromNow(12, 13), max_participants: 100, is_paid: false, price: 0 },
    { coach_id: benjaminId, title: "Session 1-to-1 — Préparation entretien final", type: "1v1", start_time: daysFromNow(6, 14), end_time: daysFromNow(6, 15), max_participants: 1, is_paid: true, price: 120 },
  ];

  const { data: insertedSessions, error: sessErr } = await supabase
    .from("coach_events")
    .insert(benjaminSessions)
    .select("id, title");
  if (sessErr) console.warn("Sessions :", sessErr.message);
  const sessionIds = (insertedSessions || []).map((s) => s.id);
  ok(`${sessionIds.length} sessions créées pour Benjamin`);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. Fanilo Rabemanantsoa — Candidat
  // ══════════════════════════════════════════════════════════════════════════
  sec("Fanilo Rabemanantsoa — Candidat");
  log(`Email : ${FANILO_EMAIL}`);

  const faniloId = await upsertUser(FANILO_EMAIL, DEFAULT_PASSWORD, {
    first_name: "Fanilo", last_name: "Rabemanantsoa",
  });

  await supabase.from("profiles").upsert({
    id: faniloId,
    first_name: "Fanilo",
    last_name: "Rabemanantsoa",
    bio: "Co-fondateur de BNJ Skills Maker. Développeur Full Stack et Product Designer passionné. En train de monter en compétences sur la stratégie de carrière et le personal branding pour mieux accompagner nos candidats.",
    role: "candidate",
    current_status: "reconversion",
    main_goal: "learn_skills",
    industry: "Tech / SaaS",
    education_level: "Master Informatique",
    strengths: ["Développement web", "Product Design", "Vision produit"],
    weaknesses: ["Personal branding", "Prise de parole publique"],
    is_onboarded: true,
  }, { onConflict: "id" });

  ok(`Fanilo Rabemanantsoa prêt (${faniloId.slice(0, 8)}...)`);

  // ── Candidats test supplémentaires pour les formations de Benjamin ────────
  // (pour qu'il y ait des inscrits visibles dans son dashboard)
  sec("Candidats test inscrits chez Benjamin");

  const extraCandidates = [
    { email: "priya.sharma@bnj-test.fr",    first_name: "Priya",     last_name: "Sharma",      industry: "Consulting",         current_status: "job_seeker",   main_goal: "find_job" },
    { email: "remi.aubert@bnj-test.fr",     first_name: "Rémi",      last_name: "Aubert",      industry: "Marketing",          current_status: "reconversion", main_goal: "change_career" },
    { email: "claire.nguyen@bnj-test.fr",   first_name: "Claire",    last_name: "Nguyen",      industry: "RH / Recrutement",   current_status: "job_seeker",   main_goal: "find_job" },
    { email: "maxime.gerard@bnj-test.fr",   first_name: "Maxime",    last_name: "Gérard",      industry: "Entrepreneuriat",    current_status: "reconversion", main_goal: "change_career" },
    { email: "sofia.delmas@bnj-test.fr",    first_name: "Sofia",     last_name: "Delmas",      industry: "Communication",      current_status: "student",      main_goal: "find_job" },
    { email: "theo.marchand@bnj-test.fr",   first_name: "Théo",      last_name: "Marchand",    industry: "Finance / Banque",   current_status: "job_seeker",   main_goal: "find_job" },
  ];

  const extraIds: string[] = [];
  for (const c of extraCandidates) {
    log(`${c.first_name} ${c.last_name}`);
    const id = await upsertUser(c.email, DEFAULT_PASSWORD, { first_name: c.first_name, last_name: c.last_name });
    extraIds.push(id);
    await supabase.from("profiles").upsert({
      id, role: "candidate", is_onboarded: true,
      first_name: c.first_name, last_name: c.last_name,
      industry: c.industry, current_status: c.current_status, main_goal: c.main_goal,
    }, { onConflict: "id" });
    ok(`  ${c.first_name} ${c.last_name}`);
  }
  const [priya, remi, claire, maxime, sofia, theo] = extraIds;

  // ── Inscriptions formations Benjamin ─────────────────────────────────────
  sec("Inscriptions aux formations de Benjamin");

  const [fId0, fId1, fId2, fId3] = benjaminFormationIds;
  const now = new Date().toISOString();

  const enrollments = [
    // Formation 0 — Personal Branding (populaire)
    ...(fId0 ? [
      { formation_id: fId0, student_id: faniloId, progress_pct: 80,  enrolled_at: daysAgo(20), has_badge: false },
      { formation_id: fId0, student_id: priya,    progress_pct: 100, enrolled_at: daysAgo(25), completed_at: daysAgo(3), has_badge: true },
      { formation_id: fId0, student_id: remi,     progress_pct: 60,  enrolled_at: daysAgo(18) },
      { formation_id: fId0, student_id: claire,   progress_pct: 40,  enrolled_at: daysAgo(14) },
      { formation_id: fId0, student_id: sofia,    progress_pct: 20,  enrolled_at: daysAgo(9) },
      { formation_id: fId0, student_id: theo,     progress_pct: 100, enrolled_at: daysAgo(30), completed_at: daysAgo(6), has_badge: true },
    ] : []),
    // Formation 1 — Stratégie de carrière 360°
    ...(fId1 ? [
      { formation_id: fId1, student_id: faniloId, progress_pct: 50,  enrolled_at: daysAgo(15) },
      { formation_id: fId1, student_id: claire,   progress_pct: 83,  enrolled_at: daysAgo(22) },
      { formation_id: fId1, student_id: maxime,   progress_pct: 33,  enrolled_at: daysAgo(10) },
      { formation_id: fId1, student_id: theo,     progress_pct: 66,  enrolled_at: daysAgo(19) },
    ] : []),
    // Formation 2 — Entrepreneuriat
    ...(fId2 ? [
      { formation_id: fId2, student_id: maxime,   progress_pct: 57,  enrolled_at: daysAgo(12) },
      { formation_id: fId2, student_id: remi,     progress_pct: 28,  enrolled_at: daysAgo(8) },
      { formation_id: fId2, student_id: faniloId, progress_pct: 14,  enrolled_at: daysAgo(5) },
    ] : []),
    // Formation 3 — LinkedIn 7 jours
    ...(fId3 ? [
      { formation_id: fId3, student_id: faniloId, progress_pct: 100, enrolled_at: daysAgo(12), completed_at: daysAgo(5), has_badge: true },
      { formation_id: fId3, student_id: priya,    progress_pct: 75,  enrolled_at: daysAgo(10) },
      { formation_id: fId3, student_id: sofia,    progress_pct: 50,  enrolled_at: daysAgo(8) },
      { formation_id: fId3, student_id: remi,     progress_pct: 100, enrolled_at: daysAgo(15), completed_at: daysAgo(2), has_badge: true },
      { formation_id: fId3, student_id: claire,   progress_pct: 25,  enrolled_at: daysAgo(4) },
    ] : []),
  ];

  const { error: enrollErr } = await supabase
    .from("formation_enrollments")
    .upsert(enrollments, { onConflict: "formation_id,student_id" });
  if (enrollErr) console.warn("Inscriptions :", enrollErr.message);
  ok(`${enrollments.length} inscriptions créées`);

  // ── Note : bookings ──────────────────────────────────────────────────────
  // La table `bookings` référence `calendar_events` (ancienne table) et non
  // `coach_events`. Les sessions de Benjamin étant dans `coach_events`, les
  // candidats sont liés via formation_enrollments (ci-dessus). Si tu veux
  // des bookings, il faut migrer la FK de bookings vers coach_events.
  const bookings: any[] = [];
  ok("Bookings ignorés (FK bookings → calendar_events, pas coach_events)");

  // ── Objectifs Fanilo ───────────────────────────────────────────────────────
  sec("Objectifs de Fanilo");
  const faniloGoals = [
    { user_id: faniloId, title: "Maîtriser le Personal Branding",    progress: 80,  target: 100 },
    { user_id: faniloId, title: "Compléter la formation Stratégie",  progress: 50,  target: 100 },
    { user_id: faniloId, title: "Publier 10 posts LinkedIn",         progress: 4,   target: 10 },
    { user_id: faniloId, title: "Obtenir 500 abonnés LinkedIn",      progress: 127, target: 500 },
    { user_id: faniloId, title: "Terminer la formation Entreprise",  progress: 14,  target: 100 },
  ];
  const { error: goalsErr } = await supabase.from("goals").insert(faniloGoals);
  if (goalsErr) console.warn("Goals Fanilo :", goalsErr.message);
  ok(`${faniloGoals.length} objectifs créés pour Fanilo`);

  // ── Résumé ────────────────────────────────────────────────────────────────
  console.log(`
\x1b[32m✅ Seed Benjamin & Fanilo terminé !\x1b[0m

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Benjamin Parienty (coach)
    ID       : ${benjaminId}
    Email    : ${BENJAMIN_EMAIL}
    Formations : ${benjaminFormationIds.length}
    Sessions   : ${sessionIds.length}

  Fanilo Rabemanantsoa (candidat)
    ID       : ${faniloId}
    Email    : ${FANILO_EMAIL}
    Inscriptions : ${enrollments.filter((e) => e.student_id === faniloId).length} formations
    Inscriptions formations : ${enrollments.filter((e) => e.student_id === faniloId).length}

  Candidats supplémentaires : ${extraCandidates.length}
  Inscriptions totales      : ${enrollments.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  \x1b[33mMot de passe :\x1b[0m ${DEFAULT_PASSWORD}

  ⚠️  Si Benjamin ou Fanilo ont déjà un compte Supabase avec ces
     emails, leurs UUIDs ont été réutilisés automatiquement.
`);
}

main().catch((e) => {
  console.error("\n\x1b[31m❌\x1b[0m", e.message ?? e);
  process.exit(1);
});
