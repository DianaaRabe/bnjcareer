import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useMyProfileQuery, useUpdateProfileMutation } from '@/graphql/hooks/profiles'
import { ProfileObjective, ProfileSituation, type UpdateProfileInput } from '@/gql/graphql'
import { useTranslate } from '@/hooks/useTranslate'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { MAX_BIO_LENGTH, MAX_IMPROVEMENTS, MAX_SKILLS, MAX_STRENGTHS, type ProfileSectionId } from './constants'

type SaveStatus = 'saved' | 'saving' | 'error'

const AUTOSAVE_DELAY_MS = 900

export const useProfile = () => {
  const { data, loading, error: loadError, refetch } = useMyProfileQuery()
  const [updateProfile] = useUpdateProfileMutation()
  const { translate } = useTranslate()

  const [activeSection, setActiveSection] = useState<ProfileSectionId>('identite')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const hydrated = useRef(false)

  // Local-only preview until a real upload endpoint exists — never sent to the API.
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [school, setSchool] = useState('')
  const [sector, setSector] = useState('')
  const [situation, setSituation] = useState<ProfileSituation | ''>('')
  const [strengths, setStrengths] = useState<string[]>([])
  const [improvements, setImprovements] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [objective, setObjective] = useState<ProfileObjective | ''>('')

  useEffect(() => {
    const profile = data?.me?.profile
    if (!profile) return
    setFirstName(profile.firstName ?? '')
    setLastName(profile.lastName ?? '')
    setBirthDate(profile.birthDate ?? '')
    setPhone(profile.phone ?? '')
    setBio(profile.bio ?? '')
    setAvatarPreview(profile.avatarUrl ?? null)
    setEducationLevel(profile.educationLevel ?? '')
    setSchool(profile.school ?? '')
    setSector(profile.sector ?? '')
    setSituation(profile.situation ?? '')
    setStrengths(profile.strengths)
    setImprovements(profile.improvements)
    setSkills(profile.skills)
    setObjective(profile.objective ?? '')
  }, [data])

  useEffect(() => {
    if (loading || !data) return
    // Skip the run triggered by hydrating state from the query above.
    if (!hydrated.current) {
      hydrated.current = true
      return
    }

    setSaveStatus('saving')
    const input: UpdateProfileInput = {
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      bio: bio || null,
      birthDate: birthDate || null,
      educationLevel: educationLevel || null,
      school: school || null,
      sector: sector || null,
      situation: situation || null,
      strengths,
      improvements,
      skills,
      objective: objective || null,
    }

    const timer = setTimeout(async () => {
      try {
        await updateProfile({ variables: { input } })
        setSaveStatus('saved')
      } catch (err) {
        setSaveStatus('error')
        const code = getGraphQLErrorCode(err)
        toast.error(translate('candidate.profile.save.error.title'), {
          description: translate(
            code === 'BAD_USER_INPUT'
              ? 'candidate.profile.save.error.invalidInput'
              : 'candidate.profile.save.error.unexpected',
          ),
        })
      }
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    firstName,
    lastName,
    phone,
    bio,
    birthDate,
    educationLevel,
    school,
    sector,
    situation,
    strengths,
    improvements,
    skills,
    objective,
  ])

  const goToSection = (id: ProfileSectionId) => setActiveSection(id)

  const addChip = (list: string[], setList: (v: string[]) => void, value: string, max: number) => {
    const trimmed = value.trim()
    if (!trimmed || list.length >= max) return
    setList([...list, trimmed])
  }
  const removeChip = (list: string[], setList: (v: string[]) => void, idx: number) => {
    setList(list.filter((_, i) => i !== idx))
  }

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  return {
    isLoading: loading && !data,
    loadError,
    retry: refetch,
    activeSection,
    goToSection,
    saveStatus,
    avatarUrl: avatarPreview,
    handleAvatarChange,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    birthDate,
    setBirthDate,
    phone,
    setPhone,
    bio,
    setBio: (v: string) => setBio(v.slice(0, MAX_BIO_LENGTH)),
    educationLevel,
    setEducationLevel,
    school,
    setSchool,
    sector,
    setSector,
    situation,
    setSituation,
    strengths,
    addStrength: (v: string) => addChip(strengths, setStrengths, v, MAX_STRENGTHS),
    removeStrength: (i: number) => removeChip(strengths, setStrengths, i),
    improvements,
    addImprovement: (v: string) => addChip(improvements, setImprovements, v, MAX_IMPROVEMENTS),
    removeImprovement: (i: number) => removeChip(improvements, setImprovements, i),
    skills,
    addSkill: (v: string) => addChip(skills, setSkills, v, MAX_SKILLS),
    removeSkill: (i: number) => removeChip(skills, setSkills, i),
    objective,
    setObjective,
  }
}
