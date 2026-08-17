import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { CvStatus } from '@/gql/graphql'
import { useCreateCvMutation, useMyCvQuery, useOptimizeCvMutation, useUpdateCvDetailsMutation } from '@/graphql/hooks/cv'
import { useTranslate } from '@/hooks/useTranslate'
import { getGraphQLErrorCode, GRAPHQL_URL } from '@/lib/apollo'
import { getToken } from '@/lib/auth'

export const UPLOAD_STEP = {
  idle: 'idle',
  selected: 'selected',
  uploading: 'uploading',
} as const

export type UploadStep = (typeof UPLOAD_STEP)[keyof typeof UPLOAD_STEP]

const ACCEPTED_MIME_TYPE = 'application/pdf'
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024
const API_BASE_URL = GRAPHQL_URL.replace(/\/graphql\/?$/, '')
const UPLOAD_URL = `${API_BASE_URL}/uploads/cv`

/** The API returns `pdfUrl` as a path relative to its own origin — resolve it against the API, not the web app. */
function toAbsolutePdfUrl(pdfUrl: string | null | undefined): string | null {
  if (!pdfUrl) return null
  return /^https?:\/\//.test(pdfUrl) ? pdfUrl : `${API_BASE_URL}${pdfUrl}`
}

export interface CvExperience {
  title: string | null
  company: string | null
  startDate: string | null
  endDate: string | null
  description: string | null
}

export interface CvEducation {
  degree: string | null
  school: string | null
  startDate: string | null
  endDate: string | null
}

export interface CvExtractedData {
  fullName: string | null
  email: string | null
  phone: string | null
  location: string | null
  linkedin: string | null
  professionalTitle: string | null
  summary: string | null
  experiences: CvExperience[]
  education: CvEducation[]
  skills: string[]
}

export interface CvImprovement {
  category: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

export const useCv = () => {
  const { translate } = useTranslate()
  const { data, loading, refetch } = useMyCvQuery()
  const [createCv] = useCreateCvMutation()
  const [runOptimizeCv, { loading: isOptimizing }] = useOptimizeCvMutation()
  const [runUpdateCvDetails] = useUpdateCvDetailsMutation()

  const [uploadStep, setUploadStep] = useState<UploadStep>(UPLOAD_STEP.idle)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [replaceOpen, setReplaceOpen] = useState(false)

  const cv = data?.myCv ?? null
  const hasCv = cv != null
  const cvUrl = toAbsolutePdfUrl(cv?.pdfUrl)
  const extractedData = (cv?.extractedData as CvExtractedData | null) ?? null
  const improvements = (cv?.improvements as CvImprovement[] | null) ?? []
  const canOptimize = cv?.status === CvStatus.Extracted || cv?.status === CvStatus.Optimized

  const [detailsName, setDetailsName] = useState('')
  const [detailsTitle, setDetailsTitle] = useState('')
  const [detailsSummary, setDetailsSummary] = useState('')

  useEffect(() => {
    setDetailsName(extractedData?.fullName ?? '')
    setDetailsTitle(extractedData?.professionalTitle ?? '')
    setDetailsSummary(extractedData?.summary ?? '')
  }, [extractedData?.fullName, extractedData?.professionalTitle, extractedData?.summary])

  const formatSize = (bytes: number) =>
    translate('candidate.cv.file.size', { value: (bytes / (1024 * 1024)).toFixed(2) })

  const pickFile = (file: File | undefined) => {
    if (!file) return
    if (file.type !== ACCEPTED_MIME_TYPE) {
      toast.error(translate('candidate.cv.upload.error.format.title'), {
        description: translate('candidate.cv.upload.error.format.description'),
      })
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(translate('candidate.cv.upload.error.size.title'), {
        description: translate('candidate.cv.upload.error.size.description'),
      })
      return
    }
    setPendingFile(file)
    setUploadStep(UPLOAD_STEP.selected)
  }

  const cancelSelection = () => {
    setPendingFile(null)
    setUploadStep(UPLOAD_STEP.idle)
  }

  const startUpload = async () => {
    if (!pendingFile) return
    setUploadStep(UPLOAD_STEP.uploading)
    const uploadingToast = toast.loading(translate('candidate.cv.upload.loading.title'), {
      description: translate('candidate.cv.upload.loading.description'),
    })

    try {
      const formData = new FormData()
      formData.append('file', pendingFile)
      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })
      if (!res.ok) throw new Error('upload_failed')
      const { url, fileName, fileSizeBytes } = await res.json()

      await createCv({ variables: { input: { pdfUrl: url, fileName, fileSizeBytes } } })
      await refetch()

      toast.dismiss(uploadingToast)
      toast.success(translate('candidate.cv.upload.success.title'), {
        description: translate('candidate.cv.upload.success.description'),
      })
    } catch (err) {
      await refetch().catch(() => {})
      toast.dismiss(uploadingToast)
      const code = getGraphQLErrorCode(err)
      if (code === 'CV_EXTRACTION_FAILED') {
        toast.error(translate('candidate.cv.extraction.error.title'), {
          description: translate('candidate.cv.extraction.error.description'),
        })
      } else {
        toast.error(translate('candidate.cv.upload.error.network.title'), {
          description: translate('candidate.cv.upload.error.network.description'),
        })
      }
    } finally {
      setUploadStep(UPLOAD_STEP.idle)
      setPendingFile(null)
      setReplaceOpen(false)
    }
  }

  const openReplaceModal = () => {
    setReplaceOpen(true)
    setUploadStep(UPLOAD_STEP.idle)
    setPendingFile(null)
  }

  const closeReplaceModal = () => {
    setReplaceOpen(false)
    setUploadStep(UPLOAD_STEP.idle)
    setPendingFile(null)
  }

  const openAtsOptimizer = async () => {
    if (!cv || !canOptimize) return
    try {
      await runOptimizeCv({ variables: { id: cv.id } })
      toast.success(translate('candidate.cv.upload.success.title'), {
        description: translate('candidate.cv.upload.success.description'),
      })
    } catch (err) {
      toast.error(translate('candidate.cv.optimize.error.title'), {
        description: translate('candidate.cv.optimize.error.description'),
      })
    }
  }

  const viewCv = () => {
    if (cvUrl) window.open(cvUrl, '_blank')
  }

  const saveDetails = async () => {
    if (!cv) return
    try {
      await runUpdateCvDetails({
        variables: {
          id: cv.id,
          input: { fullName: detailsName, professionalTitle: detailsTitle, summary: detailsSummary },
        },
      })
      toast.success(translate('candidate.cv.details.saved.title'), {
        description: translate('candidate.cv.details.saved.description'),
      })
    } catch {
      toast.error(translate('candidate.cv.details.saved.error.title'), {
        description: translate('candidate.cv.details.saved.error.description'),
      })
    }
  }

  return {
    isLoading: loading,
    hasCv,
    cvFileName: cv?.fileName ?? '',
    cvSizeBytes: cv?.fileSizeBytes ?? 0,
    justUploaded: false,
    cvUrl,
    status: cv?.status ?? null,
    canOptimize,
    isOptimizing,
    optimizedHtml: cv?.optimizedHtml ?? null,
    optimizedAt: cv?.updatedAt ?? null,
    improvements,
    uploadStep,
    pendingFile,
    isDragging,
    setIsDragging,
    replaceOpen,
    detailsName,
    setDetailsName,
    detailsTitle,
    setDetailsTitle,
    detailsSummary,
    setDetailsSummary,
    formatSize,
    pickFile,
    cancelSelection,
    startUpload,
    openReplaceModal,
    closeReplaceModal,
    openAtsOptimizer,
    viewCv,
    saveDetails,
  }
}
