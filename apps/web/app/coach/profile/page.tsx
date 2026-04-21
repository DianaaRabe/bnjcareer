import { createClient } from "@/lib/supabase/server";
import { CoachProfileForm } from "./CoachProfileForm";
import { Shield } from "lucide-react";

export default async function CoachProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-primary">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Mon Profil Coach</h1>
          <p className="text-slate-500 mt-1">Gérez votre identité professionnelle et votre offre de coaching</p>
        </div>
      </div>

      <CoachProfileForm
        initialData={profile}
        userId={user?.id ?? ""}
      />
    </div>
  );
}
