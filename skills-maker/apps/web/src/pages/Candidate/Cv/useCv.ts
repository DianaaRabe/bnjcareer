import { useState } from 'react'
import { toast } from 'sonner'

import { useTranslate } from '@/hooks/useTranslate'

export const UPLOAD_STEP = {
  idle: 'idle',
  selected: 'selected',
  uploading: 'uploading',
} as const

export type UploadStep = (typeof UPLOAD_STEP)[keyof typeof UPLOAD_STEP]

const ACCEPTED_MIME_TYPE = 'application/pdf'
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

export const useCv = () => {
  const { translate } = useTranslate()

  const [hasCv, setHasCv] = useState(false)
  const [cvFileName, setCvFileName] = useState('')
  const [cvSizeBytes, setCvSizeBytes] = useState(0)
  const [justUploaded, setJustUploaded] = useState(false)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [uploadStep, setUploadStep] = useState<UploadStep>(UPLOAD_STEP.idle)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [replaceOpen, setReplaceOpen] = useState(false)

  // TODO: seed from the CV extraction query once the API exposes it.
  const [detailsName, setDetailsName] = useState('Alice Dupont')
  const [detailsTitle, setDetailsTitle] = useState('Développeuse Front-End')
  const [detailsSummary, setDetailsSummary] = useState(
    translate('candidate.cv.details.summary.placeholder'),
  )

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

  // TODO: replace with the real upload + analysis mutation once the API exposes it.
  const startUpload = () => {
    setUploadStep(UPLOAD_STEP.uploading)
    const uploadingToast = toast.loading(translate('candidate.cv.upload.loading.title'), {
      description: translate('candidate.cv.upload.loading.description'),
    })
    setTimeout(() => {
      toast.dismiss(uploadingToast)
      const file = pendingFile
      setHasCv(true)
      setCvFileName(file?.name ?? '')
      setCvSizeBytes(file?.size ?? 0)
      setJustUploaded(true)
      setCvUrl(file ? URL.createObjectURL(file) : null)
      setUploadStep(UPLOAD_STEP.idle)
      setPendingFile(null)
      setReplaceOpen(false)
      toast.success(translate('candidate.cv.upload.success.title'), {
        description: translate('candidate.cv.upload.success.description'),
      })
    }, 1800)
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

  const openAtsOptimizer = () => {
    if (!hasCv) return
    toast(translate('candidate.cv.ats.toast.title'), {
      description: translate('candidate.cv.ats.toast.description', { fileName: cvFileName }),
    })
  }

  const viewCv = () => {
    if (cvUrl) window.open(cvUrl, '_blank')
  }

  const saveDetails = () => {
    toast.success(translate('candidate.cv.details.saved.title'), {
      description: translate('candidate.cv.details.saved.description'),
    })
  }

  return {
    hasCv,
    cvFileName,
    cvSizeBytes,
    justUploaded,
    cvUrl,
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
