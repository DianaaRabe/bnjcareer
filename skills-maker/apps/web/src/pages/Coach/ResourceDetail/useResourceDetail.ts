import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { ResourceAccess, ResourceCategory, ResourceType } from '@/gql/graphql'
import { useCoachResourceQuery, useDeleteResourceMutation, useUpdateResourceMutation } from '@/graphql/hooks/resources'
import { COACH_RESOURCES_QUERY } from '@/graphql/queries/resources'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { RESOURCE_ERROR_MESSAGE_IDS } from './constants'

export const useResourceDetail = () => {
  const { resourceId } = useParams<{ resourceId: string }>()
  const navigate = useNavigate()

  const { data, loading, error, refetch } = useCoachResourceQuery({
    variables: { id: resourceId ?? '' },
    skip: !resourceId,
  })
  const [updateResource, { loading: isSaving }] = useUpdateResourceMutation()
  const [deleteResource, { loading: isDeleting }] = useDeleteResourceMutation()

  const resource = data?.coachResource ?? null

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ResourceType | ''>('')
  const [category, setCategory] = useState<ResourceCategory | ''>('')
  const [url, setUrl] = useState('')
  const [sizeBytes, setSizeBytes] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [access, setAccess] = useState<ResourceAccess | ''>('')
  const [priceCents, setPriceCents] = useState('')
  const [saveErrorMessageId, setSaveErrorMessageId] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  // Re-seed the form only when a different resource loads — never overwrite in-progress edits.
  useEffect(() => {
    if (!resource) return
    setTitle(resource.title)
    setDescription(resource.description ?? '')
    setType(resource.type)
    setCategory(resource.category)
    setUrl(resource.url ?? '')
    setSizeBytes(resource.sizeBytes != null ? String(resource.sizeBytes) : '')
    setDurationMinutes(resource.durationMinutes != null ? String(resource.durationMinutes) : '')
    setAccess(resource.access)
    setPriceCents(resource.priceCents != null ? String(resource.priceCents) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource?.id])

  const code = error?.graphQLErrors[0]?.extensions?.code
  const loadErrorMessageId = error
    ? (RESOURCE_ERROR_MESSAGE_IDS[String(code)] ?? RESOURCE_ERROR_MESSAGE_IDS.default)
    : null

  const canSave = title.trim().length > 0 && Boolean(type) && Boolean(category) && Boolean(access) && !isSaving

  const save = async () => {
    if (!resource || !type || !category || !access || !canSave) return

    setSaveErrorMessageId(null)
    setJustSaved(false)

    try {
      await updateResource({
        variables: {
          id: resource.id,
          input: {
            title: title.trim(),
            description: description.trim() || null,
            type,
            category,
            url: url.trim() || null,
            sizeBytes: sizeBytes.trim() ? Number(sizeBytes) : null,
            durationMinutes: durationMinutes.trim() ? Number(durationMinutes) : null,
            access,
            priceCents: priceCents.trim() ? Number(priceCents) : null,
          },
        },
      })
      setJustSaved(true)
    } catch (err) {
      const saveCode = getGraphQLErrorCode(err)
      setSaveErrorMessageId(RESOURCE_ERROR_MESSAGE_IDS[String(saveCode)] ?? RESOURCE_ERROR_MESSAGE_IDS.default)
    }
  }

  const togglePublished = async () => {
    if (!resource) return
    await updateResource({ variables: { id: resource.id, input: { published: !resource.published } } })
  }

  const remove = async () => {
    if (!resource) return
    await deleteResource({
      variables: { id: resource.id },
      refetchQueries: [{ query: COACH_RESOURCES_QUERY }],
      awaitRefetchQueries: true,
    })
    navigate(ROUTES.coach.resources, { replace: true })
  }

  return {
    resource,
    isLoading: loading,
    loadErrorMessageId,
    title,
    setTitle,
    description,
    setDescription,
    type,
    setType,
    category,
    setCategory,
    url,
    setUrl,
    sizeBytes,
    setSizeBytes,
    durationMinutes,
    setDurationMinutes,
    access,
    setAccess,
    priceCents,
    setPriceCents,
    canSave,
    isSaving,
    saveErrorMessageId,
    justSaved,
    save: () => void save(),
    togglePublished: () => void togglePublished(),
    isDeleting,
    remove: () => void remove(),
    retry: () => void refetch(),
  }
}
