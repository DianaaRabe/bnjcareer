import type { Profile } from '@prisma/client'

export function toGraphQLProfile(profile: Profile) {
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    birthDate: profile.birthDate ? profile.birthDate.toISOString().slice(0, 10) : null,
    educationLevel: profile.educationLevel,
    school: profile.school,
    sector: profile.sector,
    situation: profile.situation,
    strengths: profile.strengths,
    improvements: profile.improvements,
    skills: profile.skills,
    objective: profile.objective,
  }
}
