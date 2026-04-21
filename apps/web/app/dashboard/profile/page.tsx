import { createClient } from "@/lib/supabase/server";
import { CandidateProfileForm } from "./CandidateProfileForm";
import { User } from "lucide-react";

export default async function ProfilePage() {
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

  // Fetch user's skills from the junction table
  let userSkills: string[] = [];
  if (user) {
    const { data: skillRows } = await supabase
      .from("user_skills")
      .select("skills(name)")
      .eq("user_id", user.id);

    userSkills = (skillRows ?? [])
      .map((r: any) => r.skills?.name)
      .filter(Boolean);
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-primary">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Mon Profil</h1>
          <p className="text-slate-500 mt-1">Consultez et modifiez vos informations personnelles</p>
        </div>
      </div>

      <CandidateProfileForm
        initialData={profile}
        initialSkills={userSkills}
        userId={user?.id ?? ""}
      />
    </div>
  );
}
