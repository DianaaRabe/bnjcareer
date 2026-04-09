import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";
import { Suspense } from "react";

export default async function LoginPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 underline animate-pulse">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  );
}
