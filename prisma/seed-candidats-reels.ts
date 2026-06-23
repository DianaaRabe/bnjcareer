/**
 * Seed — Candidats réels (promotion BNJ Skills Maker)
 *
 * Crée les comptes candidats à partir du Google Sheet fourni,
 * avec profils complets et liens vers les CV déjà stockés sur Supabase Storage.
 * Gère les doublons : si un email existe déjà, le compte est réutilisé (upsert).
 *
 * Usage :
 *   npx ts-node --project tsconfig.seed.json prisma/seed-candidats-reels.ts
 */

import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ogwrtegpknihxixgptqe.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3J0ZWdwa25paHhpeGdwdHFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc0MzE0NiwiZXhwIjoyMDkxMzE5MTQ2fQ.Qe52dmgdVa_XXip5xC7NxSqFnAwgWTJzZNvs6CB8EaY";

const DEFAULT_PASSWORD = "BnjCandidat2026!";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
async function upsertUser(
  email: string,
  password: string,
  meta: object
): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      const { data: list } = await supabase.auth.admin.listUsers({
        perPage: 200,
      });
      const existing = list?.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        warn(`Compte existant réutilisé : ${email} -> ${existing.id.slice(0, 8)}...`);
        return existing.id;
      }
      throw new Error(`Impossible de récupérer : ${email}`);
    }
    throw error;
  }
  return data.user!.id;
}

const log  = (m: string) => console.log(`\x1b[36m▸\x1b[0m ${m}`);
const ok   = (m: string) => console.log(`\x1b[32m✓\x1b[0m ${m}`);
const warn = (m: string) => console.log(`\x1b[33m⚠\x1b[0m ${m}`);
const sec  = (m: string) => console.log(`\n\x1b[35m━━ ${m} ━━\x1b[0m`);

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATS RÉELS
// ─────────────────────────────────────────────────────────────────────────────

const CANDIDATS = [
  {
    email: "clara.fabroni@gmail.com",
    first_name: "Clara",
    last_name: "Fabroni",
    industry: "Commerce et Marketing",
    education_level: "Licence Professionnelle Commerce Vente Marketing",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "Titulaire d'une Licence Professionnelle Commerce Vente Marketing. En recherche active d'opportunités dans le secteur commercial et marketing.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/C.V%20licence%20CVM%20-2%20ClARA%20fragoni.pdf",
    strengths: ["Marketing", "Vente", "Communication commerciale"],
    weaknesses: ["Expérience terrain"],
  },
  {
    email: "Estelleurielle@gmail.com",
    first_name: "Estelle",
    last_name: "M'Vondo",
    industry: "Management d'Affaires",
    education_level: "Mastère Management des Affaires",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "Diplômée d'un Mastère en Management des Affaires. Passionnée par la stratégie d'entreprise et le développement commercial.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20Estelle%20MVONDO%20-%20MDAc%20-%20SEPT.pdf",
    strengths: ["Management", "Stratégie commerciale", "Gestion de projet"],
    weaknesses: ["Expérience managériale"],
  },
  {
    email: "haitambriv@gmail.com",
    first_name: "Haitham",
    last_name: "Chergui",
    industry: "Commerce et Marketing",
    education_level: "Licence Commerce Vente Marketing",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En Licence Commerce Vente Marketing, déterminé à intégrer le monde professionnel dans le secteur du commerce et du marketing digital.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20HAITHAM%20CHERGUI.pdf",
    strengths: ["Commerce", "Relation client", "Marketing digital"],
    weaknesses: ["Prise de parole en public"],
  },
  {
    email: "Intisarbabouche@gmail.com",
    first_name: "Intisar",
    last_name: "Hammouche",
    industry: "Communication",
    education_level: "Licence Commerce Vente Marketing",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "Étudiante en Licence Commerce Vente Marketing avec une appétence forte pour la communication et les médias. Recherche active d'opportunités en communication et marketing.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20HAMMOUCHE%20Intisar.pdf",
    strengths: ["Communication", "Créativité", "Réseaux sociaux"],
    weaknesses: ["Expérience professionnelle"],
  },
  {
    email: "fournierhippolyte86@gmail.com",
    first_name: "Hippolyte",
    last_name: "Fournier",
    industry: "Commerce et Marketing",
    education_level: "BTS NDRC (Négociation et Digitalisation de la Relation Client)",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En BTS Négociation et Digitalisation de la Relation Client, passionné par la vente, la négociation et la relation client. Prêt à relever des défis commerciaux.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/Cv%20Hippolyte%20Fournier%20BTS%20NDRC%2026-27.pdf",
    strengths: ["Négociation", "Relation client", "Digitalisation"],
    weaknesses: ["Expérience B2B"],
  },

  // ── Nouveaux candidats (vague 2) ────────────────────────────────────────

  {
    email: "imanehaddad08@icloud.com",
    first_name: "Imane",
    last_name: "Haddad",
    industry: "Commerce",
    education_level: "BTS NDRC",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En BTS Négociation et Digitalisation de la Relation Client, motivée par le développement commercial et la relation client.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20Imane%20HADDAD%20-%20BTS%20NDRC%20-SEPT.pdf",
    strengths: ["Négociation", "Relation client", "Rigueur"],
    weaknesses: ["Expérience terrain"],
  },
  {
    email: "jorisjosephl@gmail.com",
    first_name: "Joris",
    last_name: "Joseph-Lockel",
    industry: "Commerce, Vente et Marketing",
    education_level: "Licence Commerce, Vente & Marketing en apprentissage",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En Licence Commerce, Vente & Marketing en apprentissage. Orienté résultats et passionné par les stratégies commerciales.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20Joris%20JOSEPH-LOCKEL%20-%20CVMc%20-%20SEPT.pdf",
    strengths: ["Vente", "Marketing", "Travail en équipe"],
    weaknesses: ["Management d'équipe"],
  },
  {
    email: "mensahkafui91@gmail.com",
    first_name: "Kafui",
    last_name: "Mensah",
    industry: "Management d'Affaires",
    education_level: "MBA Manager d'Affaires",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En MBA Manager d'Affaires, avec une vision stratégique du développement commercial et de la gestion d'entreprise.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/Cv%20Kafui%20MENSAH.pdf",
    strengths: ["Stratégie", "Gestion de projet", "Leadership"],
    weaknesses: ["Expérience internationale"],
  },
  {
    email: "leshnou261012@gmail.com",
    first_name: "Leshna",
    last_name: "Koonjahon",
    industry: "Commerce",
    education_level: "Bac Pro Commerce Relation Client",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "Titulaire d'un Bac Pro Commerce Relation Client, déterminée à poursuivre dans le commerce et la relation client.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20Leshna%20KOONJAHON%20BTS%20NDRC.pdf",
    strengths: ["Relation client", "Accueil", "Organisation"],
    weaknesses: ["Expérience en vente B2B"],
  },
  {
    email: "merlier.lisa@hotmail.fr",
    first_name: "Lisa",
    last_name: "Merlier",
    industry: "Commerce et Communication",
    education_level: "BTS NDRC en alternance",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En BTS NDRC en alternance, passionnée par le commerce et la communication. Recherche une opportunité pour développer ses compétences commerciales.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20Lisa%20MERLIER%20-%20BTS%20NDRC%202EME%20ANNEE%20-%20SEPT.pdf",
    strengths: ["Communication", "Commerce", "Adaptabilité"],
    weaknesses: ["Expérience professionnelle"],
  },
  {
    email: "mathieuarmelboueya@gmail.com",
    first_name: "Mathieu",
    last_name: "Boueya",
    industry: "Commerce",
    education_level: "BTS NDRC en alternance",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En BTS NDRC en alternance, motivé par le développement commercial et la digitalisation de la relation client.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20Mathieu%20Armel%20Boueya%20BTS%20NDRC%2026-27.pdf",
    strengths: ["Négociation", "Digitalisation", "Persévérance"],
    weaknesses: ["Expérience en gestion"],
  },
  {
    email: "ana.ganghat@gmail.com",
    first_name: "Anastasie",
    last_name: "Ganghat",
    industry: "Développement commercial",
    education_level: "Mastère Manager de Développement Commercial",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En Mastère Manager de Développement Commercial, orientée stratégie de croissance et développement de portefeuille clients.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20MDC%20-%20GANGHAT%20Anastasie%20-%2078_compressed.pdf",
    strengths: ["Développement commercial", "Stratégie", "Analyse de marché"],
    weaknesses: ["Expérience en management"],
  },
  {
    email: "n.halidi.pro@gmail.com",
    first_name: "Nissai",
    last_name: "Halidi",
    industry: "Commerce, Vente et Marketing",
    education_level: "Licence Commerce, Vente & Marketing",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En Licence Commerce, Vente & Marketing, avec un intérêt marqué pour la stratégie commerciale et le marketing opérationnel.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20Nissai%20HALIDI%20-%20CVMc%20-%20SEPT.pdf",
    strengths: ["Marketing", "Vente", "Esprit d'équipe"],
    weaknesses: ["Prise de parole en public"],
  },
  {
    email: "sofianechedy186@gmail.com",
    first_name: "Sofiane",
    last_name: "Chedy",
    industry: "Commerce",
    education_level: "BTS Conseil et Commercialisation de Solutions Techniques (CCST)",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En BTS CCST, spécialisé dans le conseil et la commercialisation de solutions techniques. Passionné par l'aspect technique de la vente.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/Cv%20Sofiane%20Chedy%20CCST.pdf",
    strengths: ["Conseil technique", "Vente", "Écoute active"],
    weaknesses: ["Expérience commerciale terrain"],
  },
  {
    email: "svevavirginia244@gmail.com",
    first_name: "Sveva",
    last_name: "Kuissi",
    industry: "Commerce",
    education_level: "BTS NDRC",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En BTS NDRC, motivée par la négociation commerciale et la relation client digitale.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20Sveva%20%20KUISSI%20LAPHO%2075.pdf",
    strengths: ["Négociation", "Relation client", "Autonomie"],
    weaknesses: ["Expérience en B2B"],
  },
  {
    email: "aunelletsoumou@gmail.com",
    first_name: "Aunelle-Oriane",
    last_name: "Tsoumou",
    industry: "Développement commercial",
    education_level: "M1/M2 Manager d'Affaires",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En M1/M2 Manager d'Affaires, spécialisée en développement commercial. Ambitieuse et orientée résultats.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20TSOUMOU%20Aunelle-Oriane.pdf",
    strengths: ["Développement commercial", "Management", "Stratégie"],
    weaknesses: ["Expérience à l'international"],
  },
  {
    email: "rajasrivasana@gmail.com",
    first_name: "Vasana",
    last_name: "Sabapathy",
    industry: "Management d'Affaires",
    education_level: "MBA Manager d'Affaires (Alternance)",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En MBA Manager d'Affaires en alternance, combinant théorie et pratique pour développer une expertise solide en gestion d'entreprise.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV%20Vasana%20SABAPATHY.pdf",
    strengths: ["Gestion d'entreprise", "Alternance", "Polyvalence"],
    weaknesses: ["Expérience managériale"],
  },
  {
    email: "aronn.malamine@gmail.com",
    first_name: "Aronn",
    last_name: "Diedhiou",
    industry: "Commerce",
    education_level: "BTS Négociation et Digitalisation de la Relation Client",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En BTS NDRC, passionné par la négociation et la digitalisation de la relation client. Prêt à intégrer le monde professionnel.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/CV_DIEDHIOU_ARONN%20BTS%20NDRC%2026-27.pdf",
    strengths: ["Négociation", "Digitalisation", "Détermination"],
    weaknesses: ["Expérience en entreprise"],
  },
  {
    email: "manelle.o83@gmail.com",
    first_name: "Manelle",
    last_name: "El Jiti",
    industry: "Commerce",
    education_level: "BTS NDRC",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En BTS NDRC, dynamique et orientée vers la relation client et la vente.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/EL%20JITI%20Manelle%20-%20BTS%20NDRC.pdf",
    strengths: ["Relation client", "Vente", "Dynamisme"],
    weaknesses: ["Expérience professionnelle"],
  },
  {
    email: "maellehirep@gmail.com",
    first_name: "Maëlle",
    last_name: "Hirep",
    industry: "Commerce",
    education_level: "Bac Professionnel Commerce",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "Titulaire d'un Bac Professionnel Commerce, motivée et prête à s'investir dans une carrière commerciale.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/HIREP%20Maelle%20-%20BTS%20NDRC.pdf",
    strengths: ["Commerce", "Accueil client", "Motivation"],
    weaknesses: ["Expérience en vente"],
  },
  {
    email: "kathyrhonda877@gmail.com",
    first_name: "Kathy Rhonda",
    last_name: "Watchouang",
    industry: "Commerce",
    education_level: "Bachelor REM – 3ème année",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En Bachelor REM 3ème année, avec une formation solide en commerce et gestion de la relation client.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/Kathy%20Rhonda%20WATCHOUANG%20CV.pdf",
    strengths: ["Commerce", "Gestion", "Esprit d'initiative"],
    weaknesses: ["Expérience en management"],
  },
  {
    email: "Dreammercia@icloud.com",
    first_name: "Dream",
    last_name: "Mercia Kinzonzi",
    industry: "Développement commercial",
    education_level: "Bachelor Responsable Développement Commercial",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En Bachelor Responsable Développement Commercial, ambitieuse et déterminée à construire une carrière dans le développement commercial.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/KINZONZI%20%20Dream%20-%20RDC%20.pdf",
    strengths: ["Développement commercial", "Ambition", "Relationnel"],
    weaknesses: ["Expérience en entreprise"],
  },
  {
    email: "lunamestrallet@gmail.com",
    first_name: "Luna",
    last_name: "Mestrallet",
    industry: "Marketing",
    education_level: "BTS NDRC",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En BTS NDRC avec un intérêt marqué pour le marketing. Recherche une opportunité alliant commerce et marketing digital.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/Luna%20Mestrallet%20-%20BTS%20NDRC.pdf",
    strengths: ["Marketing", "Créativité", "Commerce"],
    weaknesses: ["Expérience marketing digital"],
  },
  {
    email: "lunnatherentylechef@gmail.com",
    first_name: "Lunna",
    last_name: "Therenty-Lechef",
    industry: "Ressources Humaines",
    education_level: "BTS NDRC",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En BTS NDRC avec un attrait pour les ressources humaines. Polyvalente et orientée vers l'accompagnement professionnel.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/Lunna%20THERENTY%20LECHEF%20-%20BTS%20NDRC.pdf",
    strengths: ["Accompagnement", "Communication", "Organisation"],
    weaknesses: ["Expérience en RH"],
  },
  {
    email: "nino2004260@gmail.com",
    first_name: "Nino",
    last_name: "Valentin",
    industry: "Management d'Affaires",
    education_level: "Bachelor Responsable du Développement Commercial",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En Bachelor Responsable du Développement Commercial, déterminé à évoluer dans le management et le développement d'affaires.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/Nino_Valentin_CV%20Bachelor%20Rem.pdf",
    strengths: ["Développement commercial", "Esprit d'initiative", "Gestion"],
    weaknesses: ["Expérience managériale"],
  },
  {
    email: "samirasadikou88@gmail.com",
    first_name: "Samira",
    last_name: "Sadikou",
    industry: "Management d'Affaires",
    education_level: "Master 1 Manager des Affaires",
    current_status: "student" as const,
    main_goal: "find_job" as const,
    bio: "En Master 1 Manager des Affaires, avec une approche stratégique du management et de la gestion d'entreprise.",
    cv_storage_url:
      "https://ogwrtegpknihxixgptqe.supabase.co/storage/v1/object/public/bnj-career/cvs/Samira%20SADIKOU%20CV.pdf.pdf",
    strengths: ["Management", "Stratégie d'entreprise", "Analyse"],
    weaknesses: ["Expérience opérationnelle"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(
    "\n\x1b[1m\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m"
  );
  console.log(
    `\x1b[1m  Seed — ${CANDIDATS.length} Candidats réels (promotion BNJ)\x1b[0m`
  );
  console.log(
    "\x1b[1m\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n"
  );

  sec("Création des comptes & profils");

  const results: { name: string; email: string; password: string; id: string }[] = [];

  for (const c of CANDIDATS) {
    log(`${c.first_name} ${c.last_name} (${c.email})`);

    // 1. Create auth user
    const id = await upsertUser(c.email, DEFAULT_PASSWORD, {
      first_name: c.first_name,
      last_name: c.last_name,
    });

    // 2. Upsert profile
    const { error } = await supabase.from("profiles").upsert(
      {
        id,
        first_name: c.first_name,
        last_name: c.last_name,
        role: "candidate",
        is_onboarded: true,
        bio: c.bio,
        industry: c.industry,
        education_level: c.education_level,
        current_status: c.current_status,
        main_goal: c.main_goal,
        strengths: c.strengths,
        weaknesses: c.weaknesses,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error(`  Erreur profil ${c.email}:`, error.message);
      continue;
    }

    // 3. Insert CV into `cvs` table so the /dashboard/cv page finds it
    //    First check if a CV row already exists for this user
    const { data: existingCvs } = await supabase
      .from("cvs")
      .select("id")
      .eq("user_id", id)
      .limit(1);

    if (existingCvs && existingCvs.length > 0) {
      // Update existing row
      const { error: cvUpdateError } = await supabase
        .from("cvs")
        .update({ pdf_url: c.cv_storage_url })
        .eq("id", existingCvs[0].id);
      if (cvUpdateError) warn(`  CV update pour ${c.email}: ${cvUpdateError.message}`);
      else ok(`  CV mis à jour : ${c.first_name}`);
    } else {
      // Insert new row
      const { error: cvInsertError } = await supabase.from("cvs").insert({
        user_id: id,
        pdf_url: c.cv_storage_url,
        template: "default",
      });
      if (cvInsertError) warn(`  CV insert pour ${c.email}: ${cvInsertError.message}`);
      else ok(`  CV lié : ${c.first_name}`);
    }

    results.push({
      name: `${c.first_name} ${c.last_name}`,
      email: c.email,
      password: DEFAULT_PASSWORD,
      id,
    });

    ok(`${c.first_name} ${c.last_name} (${id.slice(0, 8)}...)`);
  }

  // ── Résumé ──────────────────────────────────────────────────────────────
  console.log(
    "\n\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m"
  );
  console.log(`\x1b[32m  ✅ ${results.length} / ${CANDIDATS.length} candidats créés avec succès\x1b[0m`);
  console.log(
    "\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n"
  );

  console.log("\x1b[33m  ACCÈS LOGIN :\x1b[0m\n");
  console.log(
    "  ┌──────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "  │  Nom                    │  Email                        │  MDP  │"
  );
  console.log(
    "  ├──────────────────────────────────────────────────────────────────┤"
  );
  for (const r of results) {
    const name = r.name.padEnd(22);
    const email = r.email.padEnd(32);
    console.log(`  │  ${name}│  ${email}│  ***  │`);
  }
  console.log(
    "  └──────────────────────────────────────────────────────────────────┘"
  );
  console.log(
    `\n  \x1b[33mMot de passe commun : ${DEFAULT_PASSWORD}\x1b[0m`
  );
  console.log(
    `  \x1b[36mConnexion via :\x1b[0m  https://bnjskillsmaker.fr/login  (email + mot de passe)\n`
  );

  // ── CV Storage URLs (pour référence) ────────────────────────────────
  console.log("\x1b[36m  CV Supabase Storage :\x1b[0m");
  for (const c of CANDIDATS) {
    console.log(`    ${c.first_name} ${c.last_name} → ${c.cv_storage_url}`);
  }
  console.log();
}

main().catch((err) => {
  console.error("\n\x1b[31m❌ Erreur :\x1b[0m", err.message ?? err);
  process.exit(1);
});
