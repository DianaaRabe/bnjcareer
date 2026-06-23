import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant/server";
import { LandingPage } from "@/components/landing/LandingPage";
import { CommunityLandingPage } from "@/components/landing/community/CommunityLandingPage";

export default async function Home() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  const tenant = getTenant();

  // Each tenant gets its own landing experience
  if (tenant.id === "community") {
    return <CommunityLandingPage />;
  }

  // FR and Africa use the standard landing (Africa inherits FR for now)
  return <LandingPage />;
}
