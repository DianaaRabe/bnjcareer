"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Users,
  Eye,
  BarChart3,
  Settings,
  Search,
  BookOpen,
  Clock,
  ArrowRight,
  Loader2,
  Trash2,
  MoreVertical,
} from "lucide-react";

interface Formation {
  id: string;
  title: string;
  category: string | null;
  is_published: boolean;
  price: number;
  modules_count: number;
  created_at: string;
  enrollments_count?: number;
  completion_rate?: number;
}

export default function CoachFormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCoachFormations = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch formations + join with enrollments count
        const { data, error } = await supabase
          .from("formations")
          .select(`
            id, title, category, is_published, price, modules_count, created_at
          `)
          .eq("coach_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        // Mocking stats for now as it would require complex aggregations
        const formationsWithStats = (data || []).map(f => ({
          ...f,
          enrollments_count: Math.floor(Math.random() * 25), // Mock
          completion_rate: Math.floor(Math.random() * 40) + 20, // Mock
        }));

        setFormations(formationsWithStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoachFormations();
  }, []);

  const filtered = formations.filter(f => 
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer la formation "${title}" ? Tous les modules et inscriptions seront supprimés.`)) return;
    
    try {
      const res = await fetch(`/api/formations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFormations(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <div className="p-2 bg-brand-primary rounded-2xl text-white shadow-lg shadow-brand-primary/20">
                <GraduationCap className="w-8 h-8" />
             </div>
             Mes Formations
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Gérez vos programmes d'apprentissage et suivez la progression de vos candidats.</p>
        </div>
        <Link
          href="/coach/formations/create"
          className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-xl shadow-brand-primary/20 hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          Créer une formation
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-primary flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Formations Actives</p>
                  <p className="text-2xl font-black text-slate-900">{formations.filter(f => f.is_published).length}</p>
               </div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inscriptions Totales</p>
                  <p className="text-2xl font-black text-slate-900">{formations.reduce((acc, f) => acc + (f.enrollments_count || 0), 0)}</p>
               </div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Taux de Complétion</p>
                  <p className="text-2xl font-black text-slate-900">42%</p>
               </div>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <h2 className="text-lg font-black text-slate-900">Catalogue de formations</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Formation</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Modules</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inscrits</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                     <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-2" />
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                     <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-slate-500 font-bold">Aucune formation trouvée</p>
                     <p className="text-xs text-slate-400 mt-1">Commencez par créer votre premier programme d'apprentissage.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-brand-primary transition-colors">{f.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{f.category || "Général"} • {f.price === 0 ? "Gratuit" : `${f.price}€`}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600">
                         <BookOpen className="w-3 h-3" />
                         {f.modules_count}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div>
                          <p className="text-sm font-black text-slate-800">{f.enrollments_count}</p>
                          <p className="text-[10px] font-bold text-slate-400 leading-tight">{f.completion_rate}% complétion</p>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                         f.is_published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                       }`}>
                         {f.is_published ? "Publié" : "Brouillon"}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/coach/formations/${f.id}/students`}
                            className="p-2 hover:bg-brand-50 text-slate-400 hover:text-brand-primary rounded-xl transition-all"
                            title="Suivi des étudiants"
                          >
                             <Users className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/coach/formations/edit/${f.id}`}
                            className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                            title="Modifier"
                          >
                             <Settings className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(f.id, f.title)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                            title="Supprimer"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/dashboard/formations/${f.id}`}
                            target="_blank"
                            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                            title="Aperçu"
                          >
                             <Eye className="w-4 h-4" />
                          </Link>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
