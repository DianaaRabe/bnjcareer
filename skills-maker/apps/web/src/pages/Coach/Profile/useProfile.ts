import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { CoachExpertise, UpdateCoachProfileInput, UpdateProfileInput } from '@/gql/graphql'
import { useMyCoachProfileQuery, useUpdateCoachProfileMutation } from '@/graphql/hooks/coaches'
import { useMyProfileQuery, useUpdateProfileMutation } from '@/graphql/hooks/profiles'
import { useTranslate } from '@/hooks/useTranslate'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { MAX_BIO_LENGTH, MAX_CERTIFICATIONS, SAVE_ERROR_MESSAGE_IDS } from './constants'

type SaveStatus = 'saved' | 'saving' | 'error'

const AUTOSAVE_DELAY_MS = 900

export const useProfile = () => {
  const { data: profileData, loading: profileLoading, error: profileError, refetch: refetchProfile } = useMyProfileQuery()
  const {
    data: coachData,
    loading: coachLoading,
    error: coachError,
    refetch: refetchCoachProfile,
  } = useMyCoachProfileQuery()
  const [updateProfile] = useUpdateProfileMutation()
  const [updateCoachProfile] = useUpdateCoachProfileMutation()
  const { translate } = useTranslate()

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const hydrated = useRef(false)

  // Local-only preview until a real upload endpoint exists — never sent to the API.
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')

  const [specialty, setSpecialty] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [certifications, setCertifications] = useState<string[]>([])
  const [expertise, setExpertise] = useState<CoachExpertise[]>([])
  const [acceptingClients, setAcceptingClients] = useState(true)
  const [published, setPublished] = useState(true)

  useEffect(() => {
    const profile = profileData?.me?.profile
    if (!profile) return
    setFirstName(profile.firstName ?? '')
    setLastName(profile.lastName ?? '')
    setPhone(profile.phone ?? '')
    setBio(profile.bio ?? '')
    setAvatarPreview(profile.avatarUrl ?? null)
  }, [profileData])

  useEffect(() => {
    const coachProfile = coachData?.myCoachProfile
    if (!coachProfile) return
    setSpecialty(coachProfile.specialty ?? '')
    setYearsExperience(coachProfile.yearsExperience != null ? String(coachProfile.yearsExperience) : '')
    setCertifications(coachProfile.certifications)
    setExpertise(coachProfile.expertise)
    setAcceptingClients(coachProfile.acceptingClients)
    setPublished(coachProfile.published)
  }, [coachData])

  useEffect(() => {
    if (profileLoading || coachLoading || !profileData || !coachData) return
    // Skip the run triggered by hydrating state from the queries above.
    if (!hydrated.current) {
      hydrated.current = true
      return
    }

    setSaveStatus('saving')

    const profileInput: UpdateProfileInput = {
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      bio: bio || null,
    }
    const coachInput: UpdateCoachProfileInput = {
      specialty: specialty || null,
      yearsExperience: yearsExperience.trim() ? Number(yearsExperience) : null,
      certifications,
      expertise,
      acceptingClients,
      published,
    }

    const timer = setTimeout(async () => {
      try {
        await Promise.all([
          updateProfile({ variables: { input: profileInput } }),
          updateCoachProfile({ variables: { input: coachInput } }),
        ])
        setSaveStatus('saved')
      } catch (err) {
        setSaveStatus('error')
        const code = getGraphQLErrorCode(err)
        toast.error(translate('coach.profile.save.error.title'), {
          description: translate(SAVE_ERROR_MESSAGE_IDS[String(code)] ?? SAVE_ERROR_MESSAGE_IDS.default),
        })
      }
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName, phone, bio, specialty, yearsExperience, certifications, expertise, acceptingClients, published])

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  const addCertification = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || certifications.length >= MAX_CERTIFICATIONS) return
    setCertifications([...certifications, trimmed])
  }
  const removeCertification = (index: number) => setCertifications(certifications.filter((_, i) => i !== index))

  const toggleExpertise = (value: CoachExpertise) => {
    setExpertise((current) => (current.includes(value) ? current.filter((v) => v !== value) : [...current, value]))
  }

  return {
    isLoading: (profileLoading && !profileData) || (coachLoading && !coachData),
    loadError: profileError ?? coachError,
    retry: () => {
      void refetchProfile()
      void refetchCoachProfile()
    },
    saveStatus,
    avatarUrl: avatarPreview,
    handleAvatarChange,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    bio,
    setBio: (v: string) => setBio(v.slice(0, MAX_BIO_LENGTH)),
    specialty,
    setSpecialty,
    yearsExperience,
    setYearsExperience,
    certifications,
    addCertification,
    removeCertification,
    expertise,
    toggleExpertise,
    acceptingClients,
    setAcceptingClients,
    published,
    setPublished,
    rating: coachData?.myCoachProfile.rating ?? null,
  }
}
