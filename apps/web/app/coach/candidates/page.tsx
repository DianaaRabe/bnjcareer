import Link from "next/link";
import {
  Search,
  Filter,
  MoreVertical,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: "actif" | "inactif" | "en pause";
  subscription: "Basic" | "Pro" | "Aucun";
  progress: number;
  lastActivity: string;
  avatar?: string;
}

const CANDIDATES: Candidate[] = [
  { id: "1", name: "Marc Dupont", email: "marc.dupont@email.com", status: "actif", subscription: "Pro", progress: 85, lastActivity: "Il y a 2h", avatar: "M" },
  { id: "2", name: "Sophie Martin", email: "s.martin@email.com", status: "actif", subscription: "Basic", progress: 40, lastActivity: "Hier", avatar: "S" },
  { id: "3", name: "Lucas Bernard", email: "lbernard@email.com", status: "en pause", subscription: "Aucun", progress: 12, lastActivity: "7 jours", avatar: "L" },
  { id: "4", name: "Emma Petit", email: "emma.petit@email.com", status: "actif", subscription: "Pro", progress: 65, lastActivity: "Il y a 5h", avatar: "E" },
  { id: "5", name: "Thomas Roux", email: "troux@email.com", status: "inactif", subscription: "Aucun", progress: 0, lastActivity: "Aujourd'hui", avatar: "T" },
  { id: "6", name: "Julie Morel", email: "morel.j@email.com", status: "actif", subscription: "Basic", progress: 92, lastActivity: "Il y a 10 min", avatar: "J" },
];

const getStatusColor = (status: Candidate["status"]) => {
  switch (status) {
    case "actif": return "bg-green-100 text-green-700";
    case "inactif": return "bg-slate-100 text-slate-600";
    case "en pause": return "bg-amber-100 text-amber-700";
    default: return "bg-slate-100 text-slate-600";
  }
};

export default function CandidatesListPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Mes Candidats</h1>
          <p className="text-slate-500 mt-1">Gérez et suivez le parcours de vos talents.</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filtrer
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-brand-primary/30 rounded-xl text-sm transition-all focus:ring-0"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidat</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Abo.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Progression</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dernière activité</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {CANDIDATES.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {candidate.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{candidate.name}</p>
                        <p className="text-xs text-slate-500">{candidate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      candidate.subscription === "Pro" ? "bg-brand-100 text-brand-primary" : 
                      candidate.subscription === "Basic" ? "bg-blue-100 text-blue-700" : 
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {candidate.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[120px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-600">{candidate.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            candidate.progress > 80 ? "bg-green-500" :
                            candidate.progress > 40 ? "bg-brand-primary" :
                            "bg-amber-500"
                          }`}
                          style={{ width: `${candidate.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{candidate.lastActivity}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-slate-400 hover:text-brand-primary transition-colors">
                          <MessageSquare className="w-4 h-4" />
                       </button>
                       <Link
                         href={`/coach/candidates/${candidate.id}`}
                         className="flex items-center gap-1 px-3 py-1.5 bg-brand-50 text-brand-primary rounded-lg text-xs font-bold hover:bg-brand-primary hover:text-white transition-all"
                       >
                         Gérer <ChevronRight className="w-3 h-3" />
                       </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-xs text-slate-500 font-medium">Affichage de 1-6 sur 24 candidats</p>
           <div className="flex gap-2">
              <button disabled className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Précédent</button>
              <button className="px-3 py-1 border border-brand-primary/20 bg-white rounded-lg text-xs font-bold text-brand-primary hover:bg-brand-50">Suivant</button>
           </div>
        </div>
      </div>
    </div>
  );
}
