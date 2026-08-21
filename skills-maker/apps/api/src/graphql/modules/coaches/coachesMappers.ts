import type { CoachProfile, Profile, User } from '@prisma/client'

export type CoachRecord = CoachProfile & {
  user: User & { profile: Profile | null }
}

export type GraphQLCoach = {
  id: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  bio: string | null
  specialty: string | null
  yearsExperience: number | null
  certifications: string[]
  expertise: CoachProfile['expertise']
  rating: number | null
  acceptingClients: boolean
}

/**
 * Identity comes from the shared Profile, coaching data from CoachProfile.
 * The id is the user's — that is what a booking or a conversation would reference.
 */
export function toGraphQLCoach(coach: CoachRecord): GraphQLCoach {
  const profile = coach.user.profile

  return {
    id: coach.user.id,
    firstName: profile?.firstName ?? null,
    lastName: profile?.lastName ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    bio: profile?.bio ?? null,
    specialty: coach.specialty,
    yearsExperience: coach.yearsExperience,
    certifications: coach.certifications,
    expertise: coach.expertise,
    rating: coach.rating,
    acceptingClients: coach.acceptingClients,
  }
}
