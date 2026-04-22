import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoachLoginForm from "./CoachLoginForm";
import { Suspense } from "react";

export default async function CoachLoginPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role === 'coach') {
      redirect("/coach");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse">Chargement...</div>}>
      <CoachLoginForm />
    </Suspense>
  );
}
