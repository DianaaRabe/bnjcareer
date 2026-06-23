import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Building2, Briefcase, Users, TrendingUp, ArrowRight, Plus } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const [companiesRes, jobsRes, profilesRes] = await Promise.allSettled([
    supabase.from('companies').select('id, is_active', { count: 'exact' }),
    supabase.from('local_jobs').select('id, is_active', { count: 'exact' }),
    supabase.from('profiles').select('id, role', { count: 'exact' }).eq('role', 'candidate'),
  ])

  const companiesCount = companiesRes.status === 'fulfilled' ? (companiesRes.value.count ?? 0) : 0
  const jobsCount      = jobsRes.status      === 'fulfilled' ? (jobsRes.value.count      ?? 0) : 0
  const candidatesCount = profilesRes.status === 'fulfilled' ? (profilesRes.value.count  ?? 0) : 0

  const activeJobs = jobsRes.status === 'fulfilled'
    ? (jobsRes.value.data ?? []).filter((j: any) => j.is_active).length
    : 0

  const stats = [
    { label: 'Entreprises',        value: companiesCount, icon: Building2, href: '/admin/companies', color: 'text-blue-400 bg-blue-500/10'    },
    { label: 'Offres actives',     value: activeJobs,     icon: Briefcase, href: '/admin/jobs',      color: 'text-brand-light bg-brand-primary/10' },
    { label: 'Total offres',       value: jobsCount,      icon: TrendingUp,href: '/admin/jobs',      color: 'text-green-400 bg-green-500/10'   },
    { label: 'Candidats inscrits', value: candidatesCount,icon: Users,     href: '#',               color: 'text-amber-400 bg-amber-500/10'   },
  ]

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Vue d'ensemble</h1>
        <p className="text-slate-400 mt-1 font-medium">Gérez les offres et entreprises de la communauté.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex items-center gap-5 hover:border-slate-600 transition-all group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
              <p className="text-3xl font-black text-white">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-400" /> Entreprises
            </h2>
            <Link href="/admin/companies" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <Link href="/admin/companies"
            className="flex items-center gap-3 w-full py-4 px-6 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl font-bold text-sm hover:bg-blue-500/20 transition-all">
            <Plus className="w-4 h-4" /> Ajouter une entreprise
          </Link>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-brand-light" /> Offres d'emploi
            </h2>
            <Link href="/admin/jobs" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <Link href="/admin/jobs"
            className="flex items-center gap-3 w-full py-4 px-6 bg-brand-primary/10 border border-brand-primary/20 text-brand-light rounded-2xl font-bold text-sm hover:bg-brand-primary/20 transition-all">
            <Plus className="w-4 h-4" /> Publier une offre
          </Link>
        </div>
      </div>
    </div>
  )
}
