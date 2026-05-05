"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Users,
  Search,
  ArrowRight,
  Trophy,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  MoreVertical,
  Mail,
} from "lucide-react";

interface Student {
  id: string;
  student_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_pct: number;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export default function FormationStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formationTitle, setFormationTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Fetch formation title
        const { data: formation } = await supabase
          .from("formations")
          .select("title")
          .eq("id", id)
          .single();
        if (formation) setFormationTitle(formation.title);

        // Fetch enrolled students
        const { data, error } = await supabase
          .from("formation_enrollments")
          .select(`
            id, student_id, enrolled_at, completed_at, progress_pct,
            profiles:student_id(first_name, last_name, avatar_url)
          `)
          .eq("formation_id", id)
          .order("enrolled_at", { ascending: false });

        if (error) throw error;
        
        // Mocking some emails for the profiles since they might not be in the direct join for now
        const studentsWithMockEmails = (data || []).map((s: any) => ({
          ...s,
          profiles: {
            ...s.profiles,
            email: `${s.profiles.first_name.toLowerCase()}@example.com` // Mocking email
          }
        }));

        setStudents(studentsWithMockEmails);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filtered = students.filter(s => 
    `${s.profiles.first_name} ${s.profiles.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/coach/formations")}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Retour au catalogue
          </button>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
                <Users className="w-6 h-6" />
             </div>
             Suivi des Étudiants
          </h1>
          <p className="text-slate-500 font-medium">{formationTitle}</p>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inscrits</p>
              <p className="text-xl font-black text-slate-900">{students.length}</p>
           </div>
           <div className="w-px h-8 bg-slate-100" />
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terminé</p>
              <p className="text-xl font-black text-green-600">{students.filter(s => s.completed_at).length}</p>
           </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <h2 className="text-lg font-black text-slate-900">Liste des inscrits</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
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
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidat</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progression</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inscription</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                     <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                     Aucun étudiant trouvé pour cette formation.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const fullName = `${s.profiles.first_name} ${s.profiles.last_name}`;
                  const enrolledDate = new Date(s.enrolled_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  });

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          {s.profiles.avatar_url ? (
                            <img src={s.profiles.avatar_url} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400">
                               {s.profiles.first_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-black text-slate-900">{fullName}</p>
                            <p className="text-[10px] font-bold text-slate-400">{s.profiles.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="max-w-[120px] mx-auto space-y-1.5">
                           <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                              <span>{s.progress_pct}%</span>
                              <CheckCircle2 className={`w-3 h-3 ${s.progress_pct === 100 ? "text-green-500" : "text-slate-200"}`} />
                           </div>
                           <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${s.progress_pct === 100 ? "bg-green-500" : "bg-brand-primary"}`}
                                style={{ width: `${s.progress_pct}%` }}
                              />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <p className="text-xs font-bold text-slate-600">{enrolledDate}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {s.completed_at ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                             <Trophy className="w-3 h-3" />
                             Certifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                             <Clock className="w-3 h-3" />
                             En cours
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                           <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                              <Mail className="w-4 h-4" />
                           </button>
                           <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                              <MoreVertical className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
