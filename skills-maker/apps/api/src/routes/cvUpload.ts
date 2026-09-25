import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import { Router, type Request } from 'express'
import multer from 'multer'
import { verifyAccessToken } from '@/graphql/modules/auth/authTokenService.js'
import { CV_MAX_FILE_SIZE_BYTES, buildCvPublicUrl, getCvUploadDir } from '@/lib/uploadStorage.js'

// multer.diskStorage doesn't create its destination — ensure it exists once at startup.
fs.mkdirSync(getCvUploadDir(), { recursive: true })

interface AuthenticatedRequest extends Request {
  userId?: string
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getCvUploadDir()),
  filename: (req, _file, cb) => cb(null, `${(req as AuthenticatedRequest).userId}-${randomUUID()}.pdf`),
})

const upload = multer({
  storage,
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
  (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded' })
      return
    }
    res.json({
      url: buildCvPublicUrl(req.file.filename),
      fileName: req.file.originalname,
      fileSizeBytes: req.file.size,
    })
  },
)
