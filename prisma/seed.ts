/**
 * Seed script — BNJ Career (v2 — données cohérentes & riches)
 *
 * Crée : 3 coachs, 8 candidats, 5 formations complètes, des sessions coach,
 *        des candidatures réelles, des objectifs, des ressources et des
 *        inscriptions avec progression variée.
 *
 * Usage :
 *   npx ts-node --project tsconfig.seed.json prisma/seed.ts
 */

import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ogwrtegpknihxixgptqe.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3J0ZWdwa25paHhpeGdwdHFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc0MzE0NiwiZXhwIjoyMDkxMzE5MTQ2fQ.Qe52dmgdVa_XXip5xC7NxSqFnAwgWTJzZNvs6CB8EaY";
const DEFAULT_PASSWORD = "Test1234!";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
async function upsertUser(email: string, password: string, meta: object): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
      const existing = list?.users.find((u) => u.email === email);
      if (existing) return existing.id;
      throw new Error(`Utilisateur introuvable : ${email}`);
    }
    throw error;
  }
  return data.user!.id;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
function hoursFromNow(n: number) {
  const d = new Date();
  d.setHours(d.getHours() + n);
  return d.toISOString();
}

function log(msg: string) { console.log(`\x1b[36m▸\x1b[0m ${msg}`); }
function ok(msg: string) { console.log(`\x1b[32m✓\x1b[0m ${msg}`); }
function section(title: string) { console.log(`\n\x1b[35m━━ ${title} ━━\x1b[0m`); }

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const COACHES = [
  {
    email: "sarah.martin@bnj-test.fr",
    first_name: "Sarah", last_name: "Martin",
    bio: "Coach certifiée PCC ICF — 8 ans en reconversion professionnelle et préparation aux entretiens. J'aide les cadres à se repositionner sur le marché avec méthode.",
    specialization: "Reconversion & Entretiens",
    experience_years: 8,
    certifications: ["PCC ICF", "MBTI Praticien"],
    session_types: ["1v1", "group"],
    support_areas: ["CV", "Entretiens", "Reconversion"],
  },
  {
    email: "thomas.dubois@bnj-test.fr",
    first_name: "Thomas", last_name: "Dubois",
    bio: "Ancien DRH Grand Groupe (15 ans) reconverti en coach professionnel. Expert en leadership, négociation salariale et stratégie de carrière pour dirigeants.",
    specialization: "Leadership & Négociation",
    experience_years: 12,
    certifications: ["Coach Professionnel RNCP", "Assesseur DISC", "Certifié Médiateur"],
    session_types: ["1v1"],
    support_areas: ["Leadership", "Négociation", "Management", "Prise de poste"],
  },
  {
    email: "camille.lerouge@bnj-test.fr",
    first_name: "Camille", last_name: "Le Rouge",
    bio: "Consultante RH et formatrice depuis 10 ans. Spécialisée dans l'accompagnement des jeunes diplômés et la préparation aux concours et grandes écoles de commerce.",
    specialization: "Insertion & Jeunes diplômés",
    experience_years: 10,
    certifications: ["CPCV", "Formatrice AFEST"],
    session_types: ["1v1", "group"],
    support_areas: ["CV", "Entretiens", "Réseautage", "Grandes écoles"],
  },
];

const CANDIDATES = [
  {
    email: "alice.dupont@bnj-test.fr",
    first_name: "Alice", last_name: "Dupont",
    bio: "Ingénieure informatique (Bac+5) de 28 ans, 4 ans d'expérience en développement back-end. En reconversion vers le Product Management.",
    current_status: "reconversion",
    main_goal: "change_career",
    industry: "Tech",
    education_level: "Master Informatique",
    strengths: ["Analyse", "Résolution de problèmes", "Communication"],
    weaknesses: ["Prise de parole en public"],
  },
  {
    email: "marc.lefevre@bnj-test.fr",
    first_name: "Marc", last_name: "Lefèvre",
    bio: "Contrôleur de gestion senior (10 ans, secteur bancaire), vise un poste de Directeur Financier en PME. En recherche active depuis 3 mois.",
    current_status: "job_seeker",
    main_goal: "find_job",
    industry: "Finance",
    education_level: "Master CCA",
    strengths: ["Rigueur", "Analyse financière", "Management"],
    weaknesses: ["Réseautage", "Personal branding"],
  },
  {
    email: "lucie.bernard@bnj-test.fr",
    first_name: "Lucie", last_name: "Bernard",
    bio: "Étudiante en 5e année à Kedge BS, spécialisation Marketing Digital. Cherche un premier emploi dans le secteur du e-commerce ou des médias.",
    current_status: "student",
    main_goal: "find_job",
    industry: "Marketing / E-commerce",
    education_level: "Bac+5 École de Commerce",
    strengths: ["Créativité", "Réseaux sociaux", "Esprit d'initiative"],
    weaknesses: ["Expérience limitée"],
  },
  {
    email: "kevin.moreau@bnj-test.fr",
    first_name: "Kevin", last_name: "Moreau",
    bio: "Commercial B2B (5 ans, industrie) ayant un projet de création d'entreprise dans le secteur de la restauration rapide haut de gamme.",
    current_status: "reconversion",
    main_goal: "change_career",
    industry: "Commerce / Entrepreneuriat",
    education_level: "BTS Technico-Commercial",
    strengths: ["Négociation", "Relation client", "Persévérance"],
    weaknesses: ["Gestion comptable", "Juridique entreprise"],
  },
  {
    email: "emma.garcia@bnj-test.fr",
    first_name: "Emma", last_name: "Garcia",
    bio: "Graphiste indépendante (7 ans) souhaitant intégrer une agence créative en CDI pour avoir plus de stabilité. Portfolio solide, excellente maîtrise Adobe.",
    current_status: "job_seeker",
    main_goal: "find_job",
    industry: "Design / Créatif",
    education_level: "BTS Communication Visuelle",
    strengths: ["Créativité", "Suite Adobe", "Sens du détail"],
    weaknesses: ["Entretiens en anglais"],
  },
  {
    email: "julien.chen@bnj-test.fr",
    first_name: "Julien", last_name: "Chen",
    bio: "Data Scientist junior (2 ans XP), double culture franco-chinoise, cherche un poste dans une scale-up ou une licorne tech française.",
    current_status: "job_seeker",
    main_goal: "improve_cv",
    industry: "Data / Tech",
    education_level: "Master Data Science — Polytechnique",
    strengths: ["Python", "Machine Learning", "Analytique"],
    weaknesses: ["Soft skills", "Communication des résultats"],
  },
  {
    email: "noemie.rousseau@bnj-test.fr",
    first_name: "Noémie", last_name: "Rousseau",
    bio: "Professeure des écoles (8 ans) souhaitant se reconvertir dans la formation professionnelle ou le conseil en pédagogie pour entreprises.",
    current_status: "reconversion",
    main_goal: "change_career",
    industry: "Éducation / Formation",
    education_level: "Master MEEF",
    strengths: ["Pédagogie", "Patience", "Organisation"],
    weaknesses: ["Monde de l'entreprise", "Réseautage pro"],
  },
  {
    email: "pierre.fontaine@bnj-test.fr",
    first_name: "Pierre", last_name: "Fontaine",
    bio: "Manager de transition (20 ans d'expérience en supply chain et logistique), cherche à sécuriser un contrat CDI en direction opérationnelle.",
    current_status: "job_seeker",
    main_goal: "find_job",
    industry: "Supply Chain / Logistique",
    education_level: "Master Ingénierie Logistique",
    strengths: ["Leadership", "Gestion de crise", "ERP SAP"],
    weaknesses: ["Digitalisation", "Réseaux sociaux pro"],
  },
];

// ── Job Offers ────────────────────────────────────────────────────────────────
const JOB_OFFERS = [
  { title: "Product Manager SaaS B2B", company: "Salesforce France", description: "Lead product strategy for SMB segment. 5+ ans XP requis.", source: "LinkedIn", url: "https://linkedin.com/jobs/1" },
  { title: "Directeur Financier – PME industrielle", company: "Groupe Mécabois", description: "Management équipe finance de 4 personnes. DSCG ou équivalent.", source: "Apec", url: "https://apec.fr/jobs/2" },
  { title: "Chargé(e) Marketing Digital", company: "Maisons du Monde", description: "Gestion des campagnes SEA/SEO et réseaux sociaux. Bac+5.", source: "Indeed", url: "https://indeed.fr/jobs/3" },
  { title: "Business Developer – Foodtech", company: "Too Good To Go", description: "Développement du réseau de partenaires restaurateurs en IDF.", source: "Welcome to the Jungle", url: "https://wttj.co/jobs/4" },
  { title: "Graphic Designer – Motion", company: "BETC Paris", company_email: "rh@betc.fr", description: "Création de contenus animés pour grandes marques. Portfolio requis.", source: "LinkedIn", url: "https://linkedin.com/jobs/5" },
  { title: "Senior Data Scientist", company: "BlaBlaCar", description: "Modélisation prédictive et NLP. Python, SQL, Spark.", source: "LinkedIn", url: "https://linkedin.com/jobs/6" },
  { title: "Responsable Formation & Pédagogie", company: "Cegos", description: "Conception de parcours e-learning. Maîtrise outils LMS.", source: "Apec", url: "https://apec.fr/jobs/7" },
  { title: "Directeur Supply Chain Europe", company: "Leroy Merlin", description: "Pilotage de 3 entrepôts régionaux et 200 collaborateurs.", source: "Apec", url: "https://apec.fr/jobs/8" },
  { title: "UX/UI Designer – App Mobile", company: "Doctolib", description: "Redesign de l'expérience patient sur iOS/Android.", source: "Welcome to the Jungle", url: "https://wttj.co/jobs/9" },
  { title: "Tech Lead – React / Node.js", company: "Contentsquare", description: "Architecture front-end, mentoring et code review.", source: "LinkedIn", url: "https://linkedin.com/jobs/10" },
  { title: "Chef de Projet Digital", company: "Capgemini", description: "Gestion de projets de transformation digitale pour grands comptes.", source: "Indeed", url: "https://indeed.fr/jobs/11" },
  { title: "Contrôleur de Gestion Groupe", company: "Sodexo", description: "Reporting mensuel, budget et forecast. Excel avancé requis.", source: "Apec", url: "https://apec.fr/jobs/12" },
];

// ── Resources ─────────────────────────────────────────────────────────────────
const RESOURCES = [
  { title: "Guide complet de rédaction de CV 2026", type: "pdf", url: "https://bnj-test.fr/ressources/cv-guide-2026.pdf" },
  { title: "Masterclass — Réussir ses entretiens (vidéo 45 min)", type: "video", url: "https://youtube.com/watch?v=entretien-masterclass" },
  { title: "Template CV moderne — Word & Canva", type: "pdf", url: "https://bnj-test.fr/ressources/template-cv-moderne.pdf" },
  { title: "Les 50 questions pièges en entretien (et comment y répondre)", type: "pdf", url: "https://bnj-test.fr/ressources/50-questions-entretien.pdf" },
  { title: "Négociation salariale — Benchmarks 2026 par secteur", type: "pdf", url: "https://bnj-test.fr/ressources/benchmarks-salaires-2026.pdf" },
  { title: "LinkedIn Strategy — Boostez votre profil en 7 jours (vidéo)", type: "video", url: "https://youtube.com/watch?v=linkedin-strategy" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Formations
// ─────────────────────────────────────────────────────────────────────────────
function buildFormations(coachIds: string[]) {
  const [sarah, thomas, camille] = coachIds;
  return [
    // ── Sarah : Formation 1 (populaire)
    {
      coach_id: sarah,
      title: "Décrocher votre emploi de rêve en 30 jours",
      description: "Un programme complet de la rédaction de CV à la négociation salariale. Méthode éprouvée avec + de 500 candidats accompagnés.",
      duration_label: "30 jours", price: 0, level: "débutant", category: "Entretien",
      is_published: true, modules_count: 5, max_students: null,
      milestones: [
        { title: "CV optimisé validé", order_index: 0 },
        { title: "Profil LinkedIn Premium activé", order_index: 1 },
        { title: "Premier entretien passé", order_index: 2 },
      ],
      modules: [
        {
          title: "Comprendre le marché de l'emploi en 2026",
          description: "Tendances, secteurs qui recrutent, erreurs à éviter.",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          duration_minutes: 22, order_index: 0,
          exercise_data: [
            { type: "qcm", question: "Quel secteur recrute le plus en France en 2026 ?", options: ["Tourisme", "Tech & IA", "Textile", "Agriculture"], correct_answer: "Tech & IA", explanation: "Le secteur tech & IA représente 35% des offres cadres en 2026." },
          ],
        },
        {
          title: "Rédiger un CV qui passe les filtres ATS",
          description: "Optimisez chaque ligne de votre CV pour les systèmes de tri automatique.", duration_minutes: 35, order_index: 1,
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          exercise_data: [{ type: "open", question: "Réécrivez votre résumé professionnel en 3 phrases percutantes.", options: [], correct_answer: "", explanation: "" }],
        },
        {
          title: "LinkedIn : transformer votre profil en aimant à recruteurs",
          description: "Optimisation complète, stratégie de contenu et networking efficace.", duration_minutes: 28, order_index: 2,
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [],
        },
        {
          title: "Préparer et réussir vos entretiens — Méthode STAR",
          description: "Gestion du stress, questions pièges et mise en situation.", duration_minutes: 45, order_index: 3,
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          exercise_data: [
            { type: "qcm", question: "Dans la méthode STAR, que signifie le « R » ?", options: ["Résultat", "Réponse", "Ressource", "Rapport"], correct_answer: "Résultat", explanation: "STAR = Situation, Tâche, Action, Résultat." },
          ],
        },
        {
          title: "Négocier son salaire avec confiance",
          description: "Scripts de négociation, benchmarks salariaux et techniques de persuasion.", duration_minutes: 30, order_index: 4,
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [],
        },
      ],
    },

    // ── Sarah : Formation 2
    {
      coach_id: sarah,
      title: "Reconversion professionnelle : de l'idée au premier jour",
      description: "Bilan de compétences, exploration métiers, plan d'action concret sur 6 semaines.", duration_label: "6 semaines", price: 49,
      level: "intermédiaire", category: "Reconversion", is_published: true, modules_count: 4, max_students: null,
      milestones: [
        { title: "Bilan de compétences complété", order_index: 0 },
        { title: "Nouveau secteur identifié", order_index: 1 },
        { title: "Plan de formation établi", order_index: 2 },
      ],
      modules: [
        { title: "Faire le point : bilan de compétences guidé", description: "Exercices pour identifier vos forces, valeurs et passions.", duration_minutes: 60, order_index: 0, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [{ type: "open", question: "Listez 5 activités qui vous procurent le plus d'énergie.", options: [], correct_answer: "", explanation: "" }] },
        { title: "Explorer les métiers qui vous correspondent", description: "Méthodes d'exploration, informational interviews et réalité du terrain.", duration_minutes: 40, order_index: 1, video_url: "", exercise_data: [] },
        { title: "Construire votre plan de formation", description: "CPF, financement, écoles reconnues et planning réaliste 12 mois.", duration_minutes: 35, order_index: 2, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [{ type: "qcm", question: "Quel dispositif finance les formations en France ?", options: ["CPF", "CAF", "APL", "ARE"], correct_answer: "CPF", explanation: "Le Compte Personnel de Formation finance les formations reconnues." }] },
        { title: "Pitcher votre reconversion à un recruteur", description: "Présenter positivement un parcours atypique et convaincre.", duration_minutes: 25, order_index: 3, video_url: "", exercise_data: [] },
      ],
    },

    // ── Thomas : Formation 3
    {
      coach_id: thomas,
      title: "Leadership & Management : passez au niveau supérieur",
      description: "Développez votre style de leadership, gérez votre équipe avec impact et préparez votre évolution.", duration_label: "8 semaines", price: 79,
      level: "avancé", category: "Leadership", is_published: true, modules_count: 5, max_students: null,
      milestones: [
        { title: "Style de leadership identifié", order_index: 0 },
        { title: "Plan de développement réalisé", order_index: 1 },
        { title: "Feedback 360° obtenu", order_index: 2 },
      ],
      modules: [
        { title: "Identifier votre style de leadership", description: "Les 6 styles de Goleman — lequel êtes-vous ?", duration_minutes: 40, order_index: 0, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [{ type: "qcm", question: "Combien de styles Goleman identifie-t-il ?", options: ["4", "5", "6", "7"], correct_answer: "6", explanation: "Directif, visionnaire, collaboratif, participatif, meneur, coach." }] },
        { title: "Communication assertive & gestion des conflits", description: "CNV, recadrage bienveillant et résolution.", duration_minutes: 50, order_index: 1, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [] },
        { title: "Déléguer efficacement sans perdre le contrôle", description: "Matrice de délégation et autonomisation.", duration_minutes: 35, order_index: 2, video_url: "", exercise_data: [] },
        { title: "Motiver et fidéliser vos talents", description: "Maslow, entretiens de motivation et reconnaissance.", duration_minutes: 30, order_index: 3, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [] },
        { title: "Préparer votre promotion interne", description: "Visibilité, réseaux d'influence et entretien annuel gagnant.", duration_minutes: 35, order_index: 4, video_url: "", exercise_data: [] },
      ],
    },

    // ── Thomas : Formation 4
    {
      coach_id: thomas,
      title: "Négociation salariale : obtenez ce que vous valez",
      description: "Maîtrisez l'art de la négociation pour obtenir le salaire et les conditions que vous méritez.", duration_label: "2 semaines", price: 0,
      level: "intermédiaire", category: "Soft Skills", is_published: true, modules_count: 3, max_students: null,
      milestones: [
        { title: "Benchmarks salariaux réalisés", order_index: 0 },
        { title: "Script de négociation préparé", order_index: 1 },
      ],
      modules: [
        { title: "Connaître votre valeur sur le marché", description: "Sources fiables, outils de benchmark et analyse sectorielle.", duration_minutes: 20, order_index: 0, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [] },
        { title: "Techniques de négociation avancées", description: "Ancrage, silence, BATNA et contreparties créatives.", duration_minutes: 35, order_index: 1, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [{ type: "qcm", question: "Que signifie BATNA ?", options: ["Best Alternative To a Negotiated Agreement", "Basic Approach To Negotiation Analysis", "Better Alternatives Than Normal Agreements", "Business Agreement and Terms Negotiation"], correct_answer: "Best Alternative To a Negotiated Agreement", explanation: "BATNA = votre meilleure alternative si la négociation échoue." }] },
        { title: "Mise en situation : simulez votre négociation", description: "Scripts détaillés, réponses aux objections et exercices.", duration_minutes: 30, order_index: 2, video_url: "", exercise_data: [{ type: "open", question: "Rédigez votre phrase d'ouverture pour annoncer vos prétentions.", options: [], correct_answer: "", explanation: "" }] },
      ],
    },

    // ── Camille : Formation 5
    {
      coach_id: camille,
      title: "Premiers pas dans le monde pro — Jeunes diplômés",
      description: "CV percutant, LinkedIn stratégique, candidatures ciblées : le programme complet pour décrocher votre premier CDI en moins de 2 mois.", duration_label: "3 semaines", price: 0,
      level: "débutant", category: "CV", is_published: true, modules_count: 4, max_students: null,
      milestones: [
        { title: "CV & lettre de motivation finalisés", order_index: 0 },
        { title: "10 candidatures envoyées", order_index: 1 },
        { title: "Premier entretien obtenu", order_index: 2 },
      ],
      modules: [
        { title: "CV première expérience — les erreurs à éviter", description: "Mise en page, valorisation stages/projets, mots-clés recruteurs.", duration_minutes: 25, order_index: 0, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [{ type: "open", question: "Réécrivez votre expérience de stage en 3 bullets impactantes.", options: [], correct_answer: "", explanation: "" }] },
        { title: "LinkedIn pour les étudiants et jeunes diplômés", description: "Créer un profil qui attire les recruteurs en stage hunting.", duration_minutes: 20, order_index: 1, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [] },
        { title: "Écrire une lettre de motivation qui sort du lot", description: "La structure parfaite, les pièges classiques et des exemples réels.", duration_minutes: 30, order_index: 2, video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", exercise_data: [{ type: "qcm", question: "Quelle section est la plus importante dans une LM ?", options: ["La conclusion", "L'accroche", "La signature", "L'adresse"], correct_answer: "L'accroche", explanation: "L'accroche doit capter l'attention en 2 lignes maximum." }] },
        { title: "Gérer son stress en entretien (jeune diplômé)", description: "Techniques de respiration, reframing et entraînement pratique.", duration_minutes: 20, order_index: 3, video_url: "", exercise_data: [] },
      ],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🌱 \x1b[1mSeed BNJ Career v2\x1b[0m — Démarrage...\n");

  // ────────────────── 1. Coachs ────────────────────────────────────────────
  section("Coachs");
  const coachIds: string[] = [];
  for (const c of COACHES) {
    log(`${c.first_name} ${c.last_name}`);
    const id = await upsertUser(c.email, DEFAULT_PASSWORD, { first_name: c.first_name, last_name: c.last_name });
    coachIds.push(id);
    const { error } = await supabase.from("profiles").upsert({ id, role: "coach", is_onboarded: true, ...c, email: undefined });
    if (error) throw error;
    ok(`${c.first_name} ${c.last_name} (${id.slice(0, 8)}...)`);
  }

  // ────────────────── 2. Candidats ─────────────────────────────────────────
  section("Candidats");
  const candidateIds: string[] = [];
  for (const c of CANDIDATES) {
    log(`${c.first_name} ${c.last_name}`);
    const id = await upsertUser(c.email, DEFAULT_PASSWORD, { first_name: c.first_name, last_name: c.last_name });
    candidateIds.push(id);
    const { error } = await supabase.from("profiles").upsert({ id, role: "candidate", is_onboarded: true, ...c, email: undefined });
    if (error) throw error;
    ok(`${c.first_name} ${c.last_name} (${id.slice(0, 8)}...)`);
  }

  // ────────────────── 3. Ressources ────────────────────────────────────────
  section("Ressources");
  const { error: resError } = await supabase.from("resources").upsert(RESOURCES, { onConflict: "url" });
  if (resError) console.warn("Ressources (déjà existantes ou erreur):", resError.message);
  ok(`${RESOURCES.length} ressources insérées`);

  // ────────────────── 4. Offres d'emploi ───────────────────────────────────
  section("Offres d'emploi");
  const { data: insertedJobs, error: jobsError } = await supabase
    .from("job_offers")
    .insert(JOB_OFFERS)
    .select("id, title");
  if (jobsError) throw jobsError;
  const jobIds = (insertedJobs || []).map((j) => j.id);
  ok(`${jobIds.length} offres d'emploi créées`);

  // ────────────────── 5. Formations ────────────────────────────────────────
  section("Formations");
  const formationDefs = buildFormations(coachIds);
  const formationIds: string[] = [];

  for (const f of formationDefs) {
    log(`"${f.title}"`);
    const { modules, milestones, ...fData } = f;
    const { data: formation, error: fErr } = await supabase.from("formations").insert(fData).select("id").single();
    if (fErr) throw fErr;
    formationIds.push(formation.id);

    if (modules.length > 0) {
      const { error: mErr } = await supabase.from("formation_modules").insert(modules.map((m) => ({ ...m, formation_id: formation.id })));
      if (mErr) throw mErr;
    }
    if (milestones.length > 0) {
      const { error: msErr } = await supabase.from("formation_milestones").insert(milestones.map((ms) => ({ ...ms, formation_id: formation.id })));
      if (msErr) throw msErr;
    }
    ok(`  "${f.title}" — ${modules.length} modules`);
  }

  // ────────────────── 6. Inscriptions aux formations ───────────────────────
  section("Inscriptions formations");
  const [fId0, fId1, fId2, fId3, fId4] = formationIds;
  const [alice, marc, lucie, kevin, emma, julien, noemie, pierre] = candidateIds;

  const enrollments = [
    // Formation 0 — Décrocher votre emploi (gratuite, populaire)
    { formation_id: fId0, student_id: alice,   progress_pct: 100, enrolled_at: daysAgo(25), completed_at: daysAgo(2), has_badge: true },
    { formation_id: fId0, student_id: marc,    progress_pct: 80,  enrolled_at: daysAgo(18) },
    { formation_id: fId0, student_id: lucie,   progress_pct: 60,  enrolled_at: daysAgo(14) },
    { formation_id: fId0, student_id: emma,    progress_pct: 40,  enrolled_at: daysAgo(10) },
    { formation_id: fId0, student_id: noemie,  progress_pct: 20,  enrolled_at: daysAgo(8) },
    { formation_id: fId0, student_id: pierre,  progress_pct: 100, enrolled_at: daysAgo(30), completed_at: daysAgo(5), has_badge: true },
    // Formation 1 — Reconversion (payante)
    { formation_id: fId1, student_id: alice,   progress_pct: 50,  enrolled_at: daysAgo(20) },
    { formation_id: fId1, student_id: noemie,  progress_pct: 75,  enrolled_at: daysAgo(22) },
    { formation_id: fId1, student_id: kevin,   progress_pct: 25,  enrolled_at: daysAgo(12) },
    // Formation 2 — Leadership (payante)
    { formation_id: fId2, student_id: pierre,  progress_pct: 60,  enrolled_at: daysAgo(15) },
    { formation_id: fId2, student_id: marc,    progress_pct: 40,  enrolled_at: daysAgo(12) },
    { formation_id: fId2, student_id: kevin,   progress_pct: 100, enrolled_at: daysAgo(35), completed_at: daysAgo(7), has_badge: true },
    // Formation 3 — Négociation (gratuite)
    { formation_id: fId3, student_id: marc,    progress_pct: 100, enrolled_at: daysAgo(20), completed_at: daysAgo(3), has_badge: true },
    { formation_id: fId3, student_id: emma,    progress_pct: 66,  enrolled_at: daysAgo(10) },
    { formation_id: fId3, student_id: julien,  progress_pct: 33,  enrolled_at: daysAgo(5) },
    // Formation 4 — Jeunes diplômés (gratuite, Camille)
    { formation_id: fId4, student_id: lucie,   progress_pct: 100, enrolled_at: daysAgo(22), completed_at: daysAgo(4), has_badge: true },
    { formation_id: fId4, student_id: julien,  progress_pct: 75,  enrolled_at: daysAgo(16) },
    { formation_id: fId4, student_id: emma,    progress_pct: 50,  enrolled_at: daysAgo(11) },
  ].filter((e) => e.formation_id);

  // Update modules_count on formations now we know the exact count
  await Promise.all(
    formationDefs.map(async (f, i) => {
      await supabase.from("formations").update({ modules_count: f.modules.length }).eq("id", formationIds[i]);
    })
  );

  const { error: enrollErr } = await supabase.from("formation_enrollments").upsert(enrollments, { onConflict: "formation_id,student_id" });
  if (enrollErr) console.warn("Inscriptions:", enrollErr.message);
  ok(`${enrollments.length} inscriptions créées`);

  // ────────────────── 7. Candidatures ──────────────────────────────────────
  section("Candidatures (applications)");

  const applications = [
    // Alice — reconversion PM
    { user_id: alice, job_offer_id: jobIds[0], status: "interview", match_score: 82, sent_at: daysAgo(15), job_title: "Product Manager SaaS B2B" },
    { user_id: alice, job_offer_id: jobIds[10], status: "sent", match_score: 70, sent_at: daysAgo(8), job_title: "Chef de Projet Digital" },
    { user_id: alice, job_offer_id: jobIds[9], status: "rejected", match_score: 55, sent_at: daysAgo(20), job_title: "Tech Lead React/Node.js" },

    // Marc — DAF
    { user_id: marc, job_offer_id: jobIds[1], status: "interview", match_score: 91, sent_at: daysAgo(10), job_title: "Directeur Financier PME" },
    { user_id: marc, job_offer_id: jobIds[11], status: "sent", match_score: 78, sent_at: daysAgo(6), job_title: "Contrôleur de Gestion Groupe" },
    { user_id: marc, job_offer_id: jobIds[0], status: "pending", match_score: 50, sent_at: daysAgo(3), job_title: "Product Manager SaaS B2B" },

    // Lucie — marketing
    { user_id: lucie, job_offer_id: jobIds[2], status: "interview", match_score: 86, sent_at: daysAgo(12), job_title: "Chargé Marketing Digital" },
    { user_id: lucie, job_offer_id: jobIds[3], status: "sent", match_score: 74, sent_at: daysAgo(7), job_title: "Business Developer Foodtech" },
    { user_id: lucie, job_offer_id: jobIds[8], status: "rejected", match_score: 62, sent_at: daysAgo(18), job_title: "UX/UI Designer App Mobile" },

    // Emma — design
    { user_id: emma, job_offer_id: jobIds[4], status: "interview", match_score: 89, sent_at: daysAgo(9), job_title: "Graphic Designer Motion" },
    { user_id: emma, job_offer_id: jobIds[8], status: "sent", match_score: 81, sent_at: daysAgo(5), job_title: "UX/UI Designer App Mobile" },

    // Julien — data
    { user_id: julien, job_offer_id: jobIds[5], status: "interview", match_score: 94, sent_at: daysAgo(7), job_title: "Senior Data Scientist" },
    { user_id: julien, job_offer_id: jobIds[9], status: "sent", match_score: 72, sent_at: daysAgo(4), job_title: "Tech Lead React/Node.js" },

    // Noémie — formation
    { user_id: noemie, job_offer_id: jobIds[6], status: "interview", match_score: 88, sent_at: daysAgo(11), job_title: "Responsable Formation" },
    { user_id: noemie, job_offer_id: jobIds[10], status: "pending", match_score: 65, sent_at: daysAgo(4), job_title: "Chef de Projet Digital" },

    // Pierre — supply chain
    { user_id: pierre, job_offer_id: jobIds[7], status: "interview", match_score: 95, sent_at: daysAgo(8), job_title: "Directeur Supply Chain Europe" },
    { user_id: pierre, job_offer_id: jobIds[1], status: "sent", match_score: 68, sent_at: daysAgo(3), job_title: "Directeur Financier PME" },

    // Kevin — entrepreneuriat
    { user_id: kevin, job_offer_id: jobIds[3], status: "pending", match_score: 71, sent_at: daysAgo(5), job_title: "Business Developer Foodtech" },
  ].filter((a) => a.job_offer_id);

  const { error: appErr } = await supabase.from("applications").insert(applications);
  if (appErr) console.warn("Applications:", appErr.message);
  ok(`${applications.length} candidatures créées`);

  // ────────────────── 8. Objectifs candidats ────────────────────────────────
  section("Objectifs");

  const goals = [
    // Alice
    { user_id: alice, title: "CV optimisé", progress: 100, target: 100 },
    { user_id: alice, title: "Candidatures cette semaine", progress: 2, target: 5 },
    { user_id: alice, title: "Formation PM complétée", progress: 50, target: 100 },
    { user_id: alice, title: "Score matching cible 85%", progress: 82, target: 85 },
    // Marc
    { user_id: marc, title: "CV DAF finalisé", progress: 100, target: 100 },
    { user_id: marc, title: "Candidatures envoyées", progress: 3, target: 10 },
    { user_id: marc, title: "Entretiens obtenus", progress: 1, target: 3 },
    // Lucie
    { user_id: lucie, title: "Portfolio créé", progress: 70, target: 100 },
    { user_id: lucie, title: "Candidatures envoyées", progress: 3, target: 10 },
    { user_id: lucie, title: "Formations complétées", progress: 1, target: 2 },
    // Emma
    { user_id: emma, title: "Book graphique mis à jour", progress: 90, target: 100 },
    { user_id: emma, title: "Entretiens obtenus", progress: 1, target: 2 },
    // Julien
    { user_id: julien, title: "CV data scientist optimisé", progress: 80, target: 100 },
    { user_id: julien, title: "Candidatures en scale-up", progress: 2, target: 5 },
    // Noémie
    { user_id: noemie, title: "CV secteur formation", progress: 100, target: 100 },
    { user_id: noemie, title: "Entretiens obtenus", progress: 1, target: 3 },
    // Pierre
    { user_id: pierre, title: "CV management optimisé", progress: 100, target: 100 },
    { user_id: pierre, title: "Entretiens obtenus", progress: 1, target: 2 },
    { user_id: pierre, title: "Formations leadership", progress: 60, target: 100 },
  ];

  const { error: goalsErr } = await supabase.from("goals").insert(goals);
  if (goalsErr) console.warn("Goals:", goalsErr.message);
  ok(`${goals.length} objectifs créés`);

  // ────────────────── 9. Sessions coach ────────────────────────────────────
  section("Sessions coach (coach_events)");

  const [sarahId, thomasId, camilleId] = coachIds;
  const sessions = [
    // Sarah — passées
    { coach_id: sarahId, title: "Atelier CV collectif — Groupe Lundi", type: "group", start_time: daysAgo(10) + "T10:00:00Z", end_time: daysAgo(10) + "T12:00:00Z", max_participants: 8, is_paid: false, price: 0 },
    { coach_id: sarahId, title: "Session 1-to-1 — Alice Dupont", type: "1v1", start_time: daysAgo(7) + "T14:00:00Z", end_time: daysAgo(7) + "T15:00:00Z", max_participants: 1, is_paid: false, price: 0 },
    { coach_id: sarahId, title: "Préparation entretien — Marc Lefèvre", type: "1v1", start_time: daysAgo(3) + "T09:00:00Z", end_time: daysAgo(3) + "T10:00:00Z", max_participants: 1, is_paid: true, price: 90 },
    // Sarah — à venir
    { coach_id: sarahId, title: "Atelier Négociation Salariale — Groupe", type: "group", start_time: daysFromNow(2) + "T10:00:00Z", end_time: daysFromNow(2) + "T12:00:00Z", max_participants: 10, is_paid: false, price: 0 },
    { coach_id: sarahId, title: "Coaching individuel — Noémie Rousseau", type: "1v1", start_time: daysFromNow(4) + "T14:30:00Z", end_time: daysFromNow(4) + "T15:30:00Z", max_participants: 1, is_paid: true, price: 90 },
    { coach_id: sarahId, title: "Atelier LinkedIn Strategy", type: "group", start_time: daysFromNow(7) + "T09:00:00Z", end_time: daysFromNow(7) + "T11:00:00Z", max_participants: 12, is_paid: false, price: 0 },

    // Thomas — passées
    { coach_id: thomasId, title: "Leadership Workshop — Managers", type: "group", start_time: daysAgo(14) + "T09:00:00Z", end_time: daysAgo(14) + "T11:00:00Z", max_participants: 6, is_paid: true, price: 150 },
    { coach_id: thomasId, title: "Session négociation — Pierre Fontaine", type: "1v1", start_time: daysAgo(5) + "T11:00:00Z", end_time: daysAgo(5) + "T12:00:00Z", max_participants: 1, is_paid: true, price: 120 },
    // Thomas — à venir
    { coach_id: thomasId, title: "Masterclass Prise de Poste Manager", type: "group", start_time: daysFromNow(3) + "T14:00:00Z", end_time: daysFromNow(3) + "T16:00:00Z", max_participants: 8, is_paid: true, price: 200 },
    { coach_id: thomasId, title: "Coaching individuel — Marc Lefèvre", type: "1v1", start_time: daysFromNow(5) + "T10:00:00Z", end_time: daysFromNow(5) + "T11:00:00Z", max_participants: 1, is_paid: true, price: 120 },

    // Camille — à venir
    { coach_id: camilleId, title: "Atelier CV Jeunes Diplômés — Mai 2026", type: "group", start_time: daysFromNow(1) + "T10:00:00Z", end_time: daysFromNow(1) + "T11:30:00Z", max_participants: 15, is_paid: false, price: 0 },
    { coach_id: camilleId, title: "Simulation entretien — Lucie Bernard", type: "1v1", start_time: hoursFromNow(36) + "", end_time: hoursFromNow(37) + "", max_participants: 1, is_paid: false, price: 0 },
    { coach_id: camilleId, title: "Groupe LinkedIn Jeunes — Juin 2026", type: "group", start_time: daysFromNow(10) + "T09:00:00Z", end_time: daysFromNow(10) + "T10:30:00Z", max_participants: 20, is_paid: false, price: 0 },
  ];

  const { error: sessErr } = await supabase.from("coach_events").insert(sessions);
  if (sessErr) console.warn("Sessions:", sessErr.message);
  ok(`${sessions.length} sessions créées`);

  // ────────────────── Résumé ────────────────────────────────────────────────
  console.log("\n\x1b[32m✅ Seed terminé avec succès !\x1b[0m\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Coachs              : ${coachIds.length}`);
  console.log(`  Candidats           : ${candidateIds.length}`);
  console.log(`  Offres d'emploi     : ${jobIds.length}`);
  console.log(`  Formations          : ${formationIds.length}`);
  console.log(`  Inscriptions        : ${enrollments.length}`);
  console.log(`  Candidatures        : ${applications.length}`);
  console.log(`  Objectifs           : ${goals.length}`);
  console.log(`  Sessions coach      : ${sessions.length}`);
  console.log(`  Ressources          : ${RESOURCES.length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\n  Mot de passe commun : \x1b[33m${DEFAULT_PASSWORD}\x1b[0m\n`);
  console.log("  \x1b[36mCoachs :\x1b[0m");
  COACHES.forEach((c) => console.log(`    ${c.email}`));
  console.log("\n  \x1b[36mCandidats :\x1b[0m");
  CANDIDATES.forEach((c) => console.log(`    ${c.email}`));
  console.log();
}

main().catch((err) => {
  console.error("\n\x1b[31m❌ Erreur :\x1b[0m", err.message ?? err);
  process.exit(1);
});
