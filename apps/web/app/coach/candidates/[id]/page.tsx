import Link from "next/link";
import {
  ChevronLeft,
  Briefcase,
  Target,
  FileText,
  Clock,
  Sparkles,
  Award,
  Calendar,
  MoreHorizontal,
  Plus,
  StickyNote,
} from "lucide-react";

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  // Mock data for the detailed view
  const candidate = {
    name: "Marc Dupont",
    role: "Développeur Front-end Junior",
    email: "marc.dupont@email.com",
    score: 88,
    cvScore: 92,
    progress: 85,
    summary: "Développeur passionné par React et Typescript. Recherche une opportunité en CDI pour mettre en pratique des compétences en développement d'interfaces modernes et performantes.",
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/coach/candidates" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-primary font-bold text-sm transition-colors group">
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Retour aux candidats
        </Link>
        <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-100">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
         <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark text-white flex items-center justify-center text-3xl font-black shrink-0 shadow-lg">
           {candidate.name.charAt(0)}
         </div>
         <div className="flex-1 space-y-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">{candidate.name}</h1>
            <p className="text-slate-500 font-medium">{candidate.role}</p>
            <div className="flex flex-wrap gap-2 pt-2">
               <span className="px-3 py-1 bg-brand-50 text-brand-primary rounded-full text-xs font-bold uppercase tracking-wider border border-brand-primary/10">Actif</span>
               <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-600/10">CDI recherché</span>
            </div>
         </div>
         <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all">
               Programmer session
            </button>
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all text-center">
               Modifier le profil
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Column: Details & Stats */}
         <div className="lg:col-span-2 space-y-8">

            {/* AI Insights & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* CV Quality card */}
               <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm group">
                  <div className="flex items-center justify-between mb-4">
                     <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                     </div>
                     <span className="text-2xl font-black text-slate-900 group-hover:text-brand-primary transition-colors">{candidate.cvScore}%</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Qualité du CV (IA)</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Le score est excellent. L'IA a optimisé les mots-clés pour le secteur tech.</p>
               </div>

               {/* Matching Score card */}
               <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm group">
                  <div className="flex items-center justify-between mb-4">
                     <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                        <Target className="w-5 h-5" />
                     </div>
                     <span className="text-2xl font-black text-slate-900 group-hover:text-green-600 transition-colors">{candidate.score}%</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Matching moyen</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Compatibilité élevée avec les offres de développeur front-end React à Paris.</p>
               </div>
            </div>

            {/* Applications History */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Candidatures (3)</h2>
                  <Link href="#" className="text-xs text-brand-primary font-bold hover:underline">Tout voir</Link>
               </div>
               <div className="space-y-4">
                  {[
                     { title: "Développeur React Junior", company: "Canal+", status: "Entretien", match: 94 },
                     { title: "Frontend Lead", company: "Payfit", status: "Refusé", match: 72 },
                     { title: "React Developer", company: "L'Oréal", status: "Envoyé", match: 88 },
                  ].map((job, idx) => (
                     <div key={idx} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                              {job.company.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{job.title}</p>
                              <p className="text-xs text-slate-500">{job.company}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              job.status === "Entretien" ? "bg-green-100 text-green-700" :
                              job.status === "Refusé" ? "bg-red-100 text-red-700" :
                              "bg-slate-100 text-slate-600"
                           }`}>
                              {job.status}
                           </span>
                           <p className="text-[10px] text-slate-400 mt-1 font-bold">Match {job.match}%</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* AI Insights & Suggestions */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="w-24 h-24" />
               </div>
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2">
                     <span className="p-1.5 bg-brand-accent rounded-lg text-brand-dark">
                        <Sparkles className="w-4 h-4 shrink-0" />
                     </span>
                     <h2 className="text-lg font-bold">Suggestions de l'IA</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-brand-accent text-xs font-bold mb-2 uppercase tracking-widest">Compétences à ajouter</p>
                        <ul className="space-y-2 text-sm text-white/80">
                           <li className="flex items-start gap-2">• Next.js (Routing App)</li>
                           <li className="flex items-start gap-2">• Tailwind CSS</li>
                        </ul>
                     </div>
                     <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-orange-400 text-xs font-bold mb-2 uppercase tracking-widest">Amélioration CV</p>
                        <p className="text-sm text-white/80 leading-relaxed">Détailler davantage la partie "Projets personnels" pour montrer l'usage de Git.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Tracking & Coaching */}
         <div className="space-y-8">
            {/* Goal Tracking */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                  <Award className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-base font-bold text-slate-900">Objectifs</h2>
               </div>
               <div className="space-y-5">
                  {[
                     { label: "CV optimisé", done: true },
                     { label: "5 candidatures / semaine", progress: 60, done: false },
                     { label: "1 entretien obtenu", done: true },
                     { label: "Test technique réussi", done: false },
                  ].map((goal, idx) => (
                     <div key={idx}>
                         <div className="flex items-center justify-between mb-2">
                            <p className={`text-sm font-semibold ${goal.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{goal.label}</p>
                            {goal.done && <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white">✓</span>}
                         </div>
                         {!goal.done && (
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div
                                 className="h-full bg-brand-primary rounded-full"
                                 style={{ width: `${goal.progress || 0}%` }}
                               />
                            </div>
                         )}
                     </div>
                  ))}
                  <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-1 mt-4">
                     <Plus className="w-3 h-3" /> Ajouter un objectif
                  </button>
               </div>
            </div>

            {/* Coach Notes */}
            <div className="bg-brand-50 rounded-2xl p-6 border border-brand-primary/10">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-brand-primary" />
                    <h2 className="text-base font-bold text-slate-900">Notes de coaching</h2>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                     <p className="text-xs text-slate-600 leading-relaxed italic">"Candidat très motivé. Doit encore travailler sa présentation orale pour le test technique du 15."</p>
                     <p className="text-[10px] text-slate-400 mt-2 font-bold mb-0">12 Avril 2024</p>
                  </div>
                  <textarea
                    placeholder="Ajouter une note..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-primary/30 min-h-[80px] resize-none"
                  />
                  <button className="w-full py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md shadow-brand-primary/20">Enregistrer</button>
               </div>
            </div>

            {/* Next session */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -translate-y-12 translate-x-12" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                       <Calendar className="w-5 h-5 text-blue-600" />
                       <h2 className="text-base font-bold text-slate-900">Prochaine session</h2>
                    </div>
                    <div className="space-y-2">
                       <p className="text-sm font-bold text-slate-800">Coaching hebdomadaire</p>
                       <p className="text-xs text-slate-500 font-medium">Mercredi 14 Avril, 10:00 - 11:00</p>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
