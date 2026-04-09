"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfileForm({ 
  initialData 
}: { 
  initialData: any 
}) {
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    bio: initialData?.bio || "",
    phone: initialData?.phone || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          phone: formData.phone,
        })
        .eq("id", session.user.id);

      if (error) {
        setMessage("Erreur lors de la mise à jour : " + error.message);
      } else {
        setMessage("Profil mis à jour avec succès !");
        router.refresh(); // Refresh la page pour mettre à jour les données SSR
      }
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.includes("Erreur") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Prénom</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium text-slate-900"
            placeholder="Jean"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Nom</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium text-slate-900"
            placeholder="Dupont"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Téléphone</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium text-slate-900"
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium text-slate-900 resize-none"
          placeholder="Dites-nous en plus sur vous..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-3 bg-brand-primary hover:bg-brand-dark text-white rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        ) : null}
        Enregistrer les modifications
      </button>
    </form>
  );
}
