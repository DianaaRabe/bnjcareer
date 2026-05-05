import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { OnboardingPayload, CandidateOnboardingData, CoachOnboardingData } from '@/types/onboarding'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: OnboardingPayload & { is_update?: boolean }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (payload.role === 'candidate') {
    const data = payload as { role: 'candidate' } & CandidateOnboardingData
    
    const updateData: Record<string, unknown> = {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      birth_date: data.birth_date || null,
      phone: data.phone?.trim() || null,
      education_level: data.education_level || null,
      training_establishment: data.training_establishment?.trim() || null,
      industry: data.industry?.trim() || null,
      current_status: data.current_status || null,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      main_goal: data.main_goal || null,
      bio: data.bio?.trim() || null,
      avatar_url: data.avatar_url || null,
      is_onboarded: true,
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (profileError) {
      console.error('[onboarding] Profile update error:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Handle skills (upsert into skills table + user_skills junction)
    if (data.skills && data.skills.length > 0) {
      const skillsError = await upsertUserSkills(supabase, user.id, data.skills)
      if (skillsError) {
        console.error('[onboarding] Skills upsert error:', skillsError)
        // Non-fatal — continue
      }
    }

  } else if (payload.role === 'coach') {
    const data = payload as { role: 'coach' } & CoachOnboardingData

    const updateData: Record<string, unknown> = {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      avatar_url: data.avatar_url || null,
      specialization: data.specialization?.trim() || null,
      experience_years: data.experience_years !== '' ? Number(data.experience_years) : null,
      certifications: data.certifications,
      previous_roles: data.previous_roles,
      bio: data.bio?.trim() || null,
      session_types: data.session_types,
      support_areas: data.support_areas,
      video_url: data.video_url || null,
      is_onboarded: true,
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (profileError) {
      console.error('[onboarding] Coach profile update error:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

  }

  // Si c'est le 1er onboarding (pas une simple mise à jour), on déclenche un Webhook Make en option
  if (!payload.is_update) {
    const webhookUrl = process.env.MAKE_WELCOME_WEBHOOK_URL
    if (webhookUrl) {
      try {
        const fetchUrl = new URL(webhookUrl)
        fetchUrl.searchParams.append('email', user.email || '')
        fetchUrl.searchParams.append('first_name', payload.first_name || '')
        fetchUrl.searchParams.append('last_name', payload.last_name || '')
        fetchUrl.searchParams.append('role', payload.role || '')

        await fetch(fetchUrl.toString(), {
          method: 'GET', // On suppose un trigger Make par simple accès URL
        })
        console.log(`[onboarding] Webhook Make déclenché pour ${user.email}`)
      } catch (err) {
        console.error('[onboarding] Erreur webhook Make:', err)
      }
    }
  }

  return NextResponse.json({ success: true })
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertUserSkills(supabase: any, userId: string, skillNames: string[]) {
  for (const name of skillNames) {
    const trimmed = name.trim().toLowerCase()
    if (!trimmed) continue

    // Upsert into skills table
    const { data: skill, error: skillErr } = await supabase
      .from('skills')
      .upsert({ name: trimmed }, { onConflict: 'name' })
      .select('id')
      .single()

    if (skillErr || !skill) continue

    // Insert into user_skills (ignore conflicts)
    await supabase
      .from('user_skills')
      .upsert({ user_id: userId, skill_id: skill.id }, { onConflict: 'user_id,skill_id' })
  }

  return null
}
