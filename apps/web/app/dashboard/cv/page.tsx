import { createClient } from "@/lib/supabase/server";
import UploadForm from "./UploadForm";
import { FileText } from "lucide-react";
import { redirect } from "next/navigation";

export default async function CVPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: cvs } = await supabase
    .from("cvs")
    .select("*")
    .eq("user_id", session.user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const existingCV = cvs && cvs.length > 0 ? cvs[0] : null;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Mon CV</h1>
          <p className="text-slate-500 mt-1">Gérez votre Curriculum Vitae</p>
        </div>
      </div>
      
      <UploadForm userId={session.user.id} existingCV={existingCV} />
    </div>
  );
}
