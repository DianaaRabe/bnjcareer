'use client'

import { useRef, useState, DragEvent, ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, User, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface AvatarUploadProps {
  currentUrl: string
  onUpload: (url: string) => void
  userId: string
}

export function AvatarUpload({ currentUrl, onUpload, userId }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La taille maximale est 5 Mo.')
      return
    }

    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    // Bucket: bnj-career (public), subfolder: avatars/{userId}/
    const filePath = `avatars/${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('bnj-career')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      console.error('[AvatarUpload] Upload error:', uploadError)
      setError(`Erreur lors de l'upload : ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('bnj-career').getPublicUrl(filePath)
    const publicUrl = data.publicUrl

    setPreview(publicUrl)
    onUpload(publicUrl)
    setUploading(false)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview circle */}
      <div className="relative">
        <div
          className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-200 ${
            dragging ? 'border-brand-primary scale-105' : 'border-brand-100'
          } bg-brand-100 flex items-center justify-center`}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Avatar"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-brand-primary/40" />
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={`w-full max-w-xs border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-brand-primary bg-brand-100'
            : 'border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
      >
        <Upload className="w-5 h-5 text-brand-primary mx-auto mb-1.5" />
        <p className="text-sm font-medium text-slate-600">
          {uploading ? 'Upload en cours...' : 'Glissez ou cliquez pour uploader'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WebP — max 5 Mo</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  )
}
