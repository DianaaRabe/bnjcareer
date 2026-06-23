// ─────────────────────────────────────────────────────────────────────────────
// Local Database Job Provider
// Reads from Supabase `local_jobs` table — used by the Community tenant.
// No external API calls. Fully controlled job database.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'
import type { JobProvider, JobSearchQuery, JobProviderResult, NormalizedJob } from './types'

function normalize(row: any): NormalizedJob {
  return {
    id:               row.id,
    source:           'local',
    title:            row.title           ?? 'Poste non spécifié',
    companyName:      row.companies?.name ?? 'Entreprise inconnue',
    companyLogo:      row.companies?.logo_url ?? null,
    location:         row.location        ?? '',
    salary:           row.salary_label    ?? null,
    contractType:     row.contract_type   ?? null,
    experienceLevel:  row.experience_level ?? null,
    remote:           row.remote          ?? null,
    sector:           row.companies?.sector ?? null,
    jobUrl:           `/jobs/community/${row.id}`,
    applyUrl:         row.application_url ?? '',
    postedDate:       row.created_at?.split('T')[0] ?? null,
    descriptionText:  row.description     ?? '',
    skills:           row.skills          ?? [],
    companyId:        row.company_id,
    applicationEmail: row.application_email ?? null,
  }
}

export class LocalDatabaseJobProvider implements JobProvider {
  async search(query: JobSearchQuery): Promise<JobProviderResult> {
    try {
      const supabase = createClient()

      let q = supabase
        .from('local_jobs')
        .select(`
          id, title, description, location, contract_type, salary_label,
          experience_level, remote, application_url, application_email,
          skills, created_at, company_id,
          companies(name, logo_url, sector)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(query.limit ?? 50)

      if (query.keywords) {
        q = q.or(`title.ilike.%${query.keywords}%,description.ilike.%${query.keywords}%`)
      }
      if (query.location) {
        q = q.ilike('location', `%${query.location}%`)
      }
      if (query.contractType?.length) {
        q = q.in('contract_type', query.contractType)
      }

      const { data, error } = await q
      if (error) throw error

      return { items: (data ?? []).map(normalize) }
    } catch (err: any) {
      return { items: [], error: err.message }
    }
  }

  async getById(id: string): Promise<NormalizedJob | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('local_jobs')
        .select(`
          id, title, description, location, contract_type, salary_label,
          experience_level, remote, application_url, application_email,
          skills, created_at, company_id,
          companies(name, logo_url, sector, website_url, description)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error || !data) return null
      return normalize(data)
    } catch {
      return null
    }
  }
}
