import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import { User } from "lucide-react";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  let profile = null;
  if (session?.user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    profile = data;
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-primary">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Mon Profil</h1>
          <p className="text-slate-500 mt-1">Gérez vos informations personnelles</p>
        </div>
      </div>
      
      <ProfileForm initialData={profile} />
    </div>
  );
}
