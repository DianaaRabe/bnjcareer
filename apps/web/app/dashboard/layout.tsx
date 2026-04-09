import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Récupérer le profil depuis la table profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single();

  const firstName = profile?.first_name || user.user_metadata?.given_name || "";
  const lastName = profile?.last_name || user.user_metadata?.family_name || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || user.email || "Candidat";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null;
  const email = user.email || "";

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <Sidebar fullName={fullName} email={email} avatarUrl={avatarUrl} />
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        {/* On passe firstName via searchParams n'est pas idéal,
            le dashboard page récupèrera ses propres données */}
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
