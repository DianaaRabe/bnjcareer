import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { Suspense } from "react";

export default async function ForgotPasswordPage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse">
          Chargement...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
