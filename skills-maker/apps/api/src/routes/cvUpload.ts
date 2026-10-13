import { randomUUID } from 'node:crypto'
import { Router, type Request } from 'express'
import multer from 'multer'
import { verifyAccessToken } from '@/graphql/modules/auth/authTokenService.js'
import { CV_MAX_FILE_SIZE_BYTES } from '@/lib/uploadStorage.js'
import { uploadCvToStorage } from '@/lib/supabaseStorage.js'

// CVs are held in memory only long enough to stream them into Supabase Storage — nothing
// touches local disk, so any API instance or the automation worker can read them back.

interface AuthenticatedRequest extends Request {
  userId?: string
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CV_MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype === 'application/pdf'),
})

export const cvUploadRouter = Router()

cvUploadRouter.post(
  '/cv',
  (req: AuthenticatedRequest, res, next) => {
    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null
    const payload = token ? verifyAccessToken(token) : null
    if (!payload) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    req.userId = payload.sub
    next()
  },
  upload.single('file'),
  async (req: AuthenticatedRequest, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded' })
      return
    }
    try {
      const objectPath = `cvs/${req.userId}/${randomUUID()}.pdf`
      const url = await uploadCvToStorage(objectPath, req.file.buffer)
      res.json({ url, fileName: req.file.originalname, fileSizeBytes: req.file.size })
    } catch (err) {
      console.error('[cvUpload] Supabase storage upload failed:', (err as Error).message)
      res.status(502).json({ error: 'CV storage upload failed' })
    }
  },
)
