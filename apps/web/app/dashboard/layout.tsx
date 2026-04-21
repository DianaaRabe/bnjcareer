import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
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

  // Fetch profile including onboarding status
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url, is_onboarded, role")
    .eq("id", user.id)
    .single();

  const firstName = profile?.first_name || user.user_metadata?.given_name || "";
  const lastName = profile?.last_name || user.user_metadata?.family_name || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || user.email || "Candidat";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null;
  const email = user.email || "";

  // Show onboarding if not yet completed
  const needsOnboarding = !profile?.is_onboarded;

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <Sidebar fullName={fullName} email={email} avatarUrl={avatarUrl} />
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        {children}
      </main>
      <BottomNav />

      {/* Onboarding modal – rendered as overlay when needed */}
      {needsOnboarding && (
        <OnboardingModal role="candidate" userId={user.id} />
      )}
    </div>
  );
}
