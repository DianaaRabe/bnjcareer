import { CoachSidebar } from "@/components/layout/CoachSidebar";
import { CoachBottomNav } from "@/components/layout/CoachBottomNav";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CoachLayout({
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
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || user.email || "Coach";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null;
  const email = user.email || "";

  // Show onboarding if not yet completed
  const needsOnboarding = !profile?.is_onboarded;

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <CoachSidebar fullName={fullName} email={email} avatarUrl={avatarUrl} />
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        {children}
      </main>
      <CoachBottomNav />

      {/* Onboarding modal – rendered as overlay when needed */}
      {needsOnboarding && (
        <OnboardingModal role="coach" userId={user.id} />
      )}
    </div>
  );
}
