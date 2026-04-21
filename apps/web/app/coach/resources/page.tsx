import {
  FileText,
  Video,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Users,
  Eye,
  Download,
  Share2,
} from "lucide-react";

const RESOURCES = [
  { id: 1, title: "Guide CV IA 2024", type: "PDF", category: "Apprendre", size: "2.4 MB", stats: "128 vues", color: "text-red-500 bg-red-50" },
  { id: 2, title: "Réussir son entretien VTC", type: "Vidéo", category: "Coaching", duration: "12:45", stats: "85 vues", color: "text-blue-500 bg-blue-50" },
  { id: 3, title: "Optimiser son LinkedIn", type: "Article", category: "Social", link: "bnj.career/tips", stats: "240 vues", color: "text-brand-primary bg-brand-50" },
  { id: 4, title: "Modèle de lettre de motivation", type: "Doc", category: "Outils", size: "156 KB", stats: "312 vues", color: "text-indigo-500 bg-indigo-50" },
];

export default function ResourcesPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Bibliothèque de Ressources</h1>
          <p className="text-slate-500 mt-1">Partagez des documents et tutoriels avec vos candidats.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all">
          <Plus className="w-4 h-4" />
          Ajouter une ressource
        </button>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                 type="text"
                 placeholder="Rechercher une ressource (ex: CV, Entretien...)"
                 className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-1 focus:ring-brand-primary/30 shadow-sm transition-all"
              />
           </div>
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              Filtrer par type
           </button>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {RESOURCES.map((res) => (
             <div key={res.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${res.color} transition-transform group-hover:scale-110 shadow-inner`}>
                      {res.type === "Vidéo" ? <Video className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                   </div>
                   <div className="flex gap-1">
                      <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-50 rounded-lg transition-all" title="Partager">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1 block">{res.category}</span>
                   <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-primary transition-colors leading-tight mb-2">{res.title}</h3>
                   <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {res.stats}</span>
                      <span className="flex items-center gap-1">• {res.size || res.duration || res.type}</span>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                   <button className="flex items-center gap-2 text-xs font-bold text-brand-primary hover:underline">
                      <Users className="w-4 h-4" />
                      Assigner à...
                   </button>
                   <button className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                      Aperçu <ExternalLink className="w-3 h-3" />
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Stats Bottom Bar */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
         <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl font-bold">Ressources les plus performantes</h2>
            <p className="text-white/50 text-sm">Basez-vous sur les outils qui aident le plus vos candidats.</p>
         </div>
         <div className="flex gap-8">
            <div className="text-center">
               <p className="text-brand-accent text-2xl font-black">85%</p>
               <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Utilisation</p>
            </div>
            <div className="text-center border-l border-white/10 pl-8">
               <p className="text-blue-400 text-2xl font-black">1.2k</p>
               <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Total vues</p>
            </div>
         </div>
      </div>
    </div>
  );
}
