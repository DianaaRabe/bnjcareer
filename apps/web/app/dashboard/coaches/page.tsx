"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, SlidersHorizontal, Loader2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CoachCard } from "@/components/coaches/CoachCard";

export default function CoachesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [coaches, setCoaches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCoaches = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("role", "coach");

      if (data) setCoaches(data);
      if (error) console.error("Error fetching coaches:", error);
      setIsLoading(false);
    };

    fetchCoaches();
  }, [supabase]);

  const filteredCoaches = coaches.filter((coach) => {
    const searchStr = searchQuery.toLowerCase();
    const fullName = `${coach.first_name || ""} ${coach.last_name || ""}`.toLowerCase();
    const specialization = (coach.specialization || "").toLowerCase();
    const bio = (coach.bio || "").toLowerCase();

    return (
      fullName.includes(searchStr) ||
      specialization.includes(searchStr) ||
      bio.includes(searchStr)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-primary text-xs font-bold uppercase tracking-wider">
            <Users className="w-3 h-3" />
            Communauté
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Trouvez votre <span className="text-brand-primary">Coach Idéal</span>
          </h1>
          <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
            Découvrez des experts certifiés pour vous accompagner dans votre transition, 
            votre recherche d'emploi ou votre montée en compétences.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Nom, spécialisation, expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Filters (MVP - Visual only for now) */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-6">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:scale-105 transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          Tous les filtres
        </button>
        {["Stratégie CV", "Entretiens", "LinkedIn", "Négociation"].map((tag) => (
          <button 
            key={tag}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:border-brand-primary hover:text-brand-primary transition-all"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
            <div className="absolute inset-0 blur-xl bg-brand-primary/20 animate-pulse" />
          </div>
          <p className="text-slate-500 font-bold animate-pulse">Chargement des meilleurs coachs...</p>
        </div>
      ) : filteredCoaches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCoaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Aucun coach trouvé</h3>
          <p className="text-slate-500 mt-1 max-w-xs mx-auto">
            Nous n'avons trouvé aucun résultat pour "{searchQuery}". Essayez avec d'autres mots-clés.
          </p>
          <button 
            onClick={() => setSearchQuery("")}
            className="mt-6 text-brand-primary font-bold hover:underline"
          >
            Effacer la recherche
          </button>
        </div>
      )}
    </div>
  );
}
