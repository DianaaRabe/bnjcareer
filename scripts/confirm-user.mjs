// ─────────────────────────────────────────────────────────────────────────────
// confirm-user.mjs
//
// Crée (ou complète) la ligne `profiles` d'un utilisateur qui existe déjà dans
// l'authentification Supabase mais pas encore dans la table public.profiles.
// Confirme aussi son email si ce n'est pas déjà fait.
//
// Lancer depuis la racine "E:\BNJ Career" :
//   node scripts/confirm-user.mjs
//
// Utilise SUPABASE_SERVICE_ROLE_KEY (clé service role) — ne jamais exposer côté client.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Les clés sont dans apps/web/.env.local
config({ path: resolve(__dirname, "../apps/web/.env.local") });

// ── Données de l'utilisateur à confirmer ─────────────────────────────────────
const TARGET = {
  email: "charlencardoso97@gmail.com",
  firstName: "Charlène",
  lastName: "Cardoso",
  role: "candidate",
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌ Variables manquantes. Vérifie NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans apps/web/.env.local"
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── 1. Retrouver l'utilisateur auth par email (listUsers paginé) ─────────────
async function findAuthUserByEmail(email) {
  const target = email.toLowerCase().trim();
  let page = 1;
  const perPage = 200;
  // Boucle de pagination jusqu'à trouver ou épuiser la liste
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => (u.email || "").toLowerCase() === target);
    if (found) return found;
    if (data.users.length < perPage) return null; // dernière page atteinte
    page += 1;
  }
}

async function main() {
  console.log(`🔎 Recherche de l'utilisateur auth : ${TARGET.email}`);
  const user = await findAuthUserByEmail(TARGET.email);

  if (!user) {
    console.error(
      "❌ Aucun utilisateur avec cet email dans l'authentification. Rien à faire."
    );
    process.exit(1);
  }
  console.log(`✅ Trouvé dans auth. id = ${user.id}`);

  // ── 2. Confirmer l'email si nécessaire ─────────────────────────────────────
  if (!user.email_confirmed_at) {
    const { error: confirmErr } = await admin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (confirmErr) {
      console.error("⚠️  Impossible de confirmer l'email :", confirmErr.message);
    } else {
      console.log("📧 Email confirmé.");
    }
  } else {
    console.log("📧 Email déjà confirmé.");
  }

  // ── 3. Upsert de la ligne profiles ─────────────────────────────────────────
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const { error: upsertErr } = await admin.from("profiles").upsert(
    {
      id: user.id, // doit correspondre à auth.users.id (FK)
      first_name: TARGET.firstName,
      last_name: TARGET.lastName,
      role: TARGET.role,
    },
    { onConflict: "id" }
  );

  if (upsertErr) {
    console.error("❌ Échec de l'upsert profiles :", upsertErr.message);
    process.exit(1);
  }

  console.log(
    existing
      ? "🔄 Profil existant mis à jour dans public.profiles."
      : "🆕 Profil créé dans public.profiles."
  );
  console.log("🎉 Terminé. L'utilisateur est confirmé et présent dans profiles.");
}

main().catch((e) => {
  console.error("💥 Erreur inattendue :", e);
  process.exit(1);
});
