"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Clock,
  Users,
  BookOpen,
  Star,
  ChevronRight,
  Filter,
  Sparkles,
  Lock,
  Tag,
} from "lucide-react";

interface Formation {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  duration_label: string;
  price: number;
  level: string;
  category: string;
  modules_count: number;
  profiles: { first_name: string; last_name: string; avatar_url: string | null } | null;
}

const CATEGORIES = ["Tous", "Entretien", "CV", "Reconversion", "Soft Skills", "Technique", "Leadership"];
const LEVELS = ["Tous", "débutant", "intermédiaire", "avancé"];

const LEVEL_COLORS: Record<string, string> = {
  débutant: "bg-green-100 text-green-700",
  intermédiaire: "bg-amber-100 text-amber-700",
  avancé: "bg-rose-100 text-rose-700",
};

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedLevel, setSelectedLevel] = useState("Tous");

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "Tous") params.set("category", selectedCategory);
        if (selectedLevel !== "Tous") params.set("level", selectedLevel);
        const res = await fetch(`/api/formations?${params.toString()}`);
        const data = await res.json();
        setFormations(data.formations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormations();
  }, [selectedCategory, selectedLevel]);

  const filtered = formations.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-brand-primary" />
            Formations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Développez vos compétences et obtenez une certification reconnue
          </p>
        </div>
        <div className="flex items-center gap-2 bg-brand-100 text-brand-primary px-4 py-2 rounded-full text-sm font-semibold self-start">
          <Sparkles className="w-4 h-4" />
          {formations.length} formations disponibles
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category filter */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" /> Catégorie
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedCategory === cat
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary/40 hover:text-brand-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Level filter */}
          <div className="sm:w-56">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Niveau
            </div>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
                    selectedLevel === lvl
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-40 bg-slate-100 rounded-xl mb-4" />
              <div className="h-5 bg-slate-100 rounded mb-2 w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <GraduationCap className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">Aucune formation trouvée</h3>
          <p className="text-slate-400 text-sm">
            {formations.length === 0
              ? "Les formations arrivent bientôt. Revenez vérifier prochainement !"
              : "Essayez avec d'autres filtres ou une autre recherche."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((formation) => {
            const coachName = formation.profiles
              ? `${formation.profiles.first_name} ${formation.profiles.last_name}`
              : "Coach BNJ";
            const isFree = formation.price === 0;

            return (
              <Link
                key={formation.id}
                href={`/dashboard/formations/${formation.id}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Thumbnail */}
                <div className="h-44 bg-gradient-to-br from-brand-dark to-brand-primary relative overflow-hidden">
                  {formation.thumbnail_url ? (
                    <img
                      src={formation.thumbnail_url}
                      alt={formation.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  {/* Price badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                    isFree
                      ? "bg-green-500 text-white"
                      : "bg-white text-slate-800"
                  }`}>
                    {isFree ? "Gratuit" : `${formation.price}€`}
                  </div>
                  {/* Level badge */}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                    LEVEL_COLORS[formation.level] || "bg-slate-100 text-slate-600"
                  }`}>
                    {formation.level}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                  {formation.category && (
                    <span className="text-xs font-semibold text-brand-primary bg-brand-50 px-2.5 py-1 rounded-full self-start mb-3">
                      {formation.category}
                    </span>
                  )}
                  <h3 className="font-bold text-slate-900 text-base leading-tight mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                    {formation.title}
                  </h3>
                  {formation.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
                      {formation.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {formation.modules_count} module{formation.modules_count > 1 ? "s" : ""}
                    </span>
                    {formation.duration_label && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formation.duration_label}
                      </span>
                    )}
                    <span className="ml-auto flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-slate-700 font-semibold">{coachName}</span>
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Lock className="w-3 h-3" />
                      Certificat inclus
                    </div>
                    <div className="flex items-center gap-1 text-xs text-brand-primary font-bold group-hover:translate-x-1 transition-transform">
                      Voir la formation <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
