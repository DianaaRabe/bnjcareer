import { createClient } from "@/lib/supabase/server";
import UploadForm from "./UploadForm";
import { FileText, Sparkles } from "lucide-react";
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

  // Fetch latest completed optimization
  let latestOptimization = null;
  try {
    const { data: optimizations } = await supabase
      .from("cv_optimizations")
      .select("id, optimized_html, improvements, original_cv_url, status, created_at")
      .eq("user_id", session.user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1);

    if (optimizations && optimizations.length > 0) {
      latestOptimization = optimizations[0];
    }
  } catch (err) {
    // Table may not exist yet — silently ignore
    console.error("[cv page] Optimization fetch error:", err);
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Mon CV</h1>
            <p className="text-slate-500 mt-1">Gérez et optimisez votre Curriculum Vitae</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-brand-100 text-brand-primary px-4 py-2 rounded-full text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          ATS Optimizer
        </div>
      </div>
      
      <UploadForm
        userId={session.user.id}
        existingCV={existingCV}
        latestOptimization={latestOptimization}
      />
    </div>
  );
}
