import fs from 'node:fs/promises'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import pdf from 'pdf-parse'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import { callLLM, LLMError } from '@/lib/llmClient.js'
import { CV_MAX_FILE_SIZE_BYTES, publicUrlToFilePath } from '@/lib/uploadStorage.js'
import { buildExtractionPrompt, buildOptimizationPrompt, type CvJobContext, type CvTemplateKey } from './cvPrompts.js'
import { parseExtractionResult, parseOptimizationResult } from './cvLlmParsing.js'

const createCvSchema = z.object({
  pdfUrl: z.string().min(1),
  fileName: z.string().min(1),
  fileSizeBytes: z.number().int().positive().max(CV_MAX_FILE_SIZE_BYTES),
})

const updateCvDetailsSchema = z.object({
  fullName: z.string().trim().min(1).nullable().optional(),
  professionalTitle: z.string().trim().min(1).nullable().optional(),
  summary: z.string().trim().min(1).nullable().optional(),
})

const jobContextSchema = z.object({
  jobTitle: z.string().trim().max(300).nullable().optional(),
  company: z.string().trim().max(300).nullable().optional(),
  description: z.string().trim().min(1).max(20000),
})

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } })
}

async function getOwnedCv(ctx: Context, id: string) {
  const cv = await ctx.prisma.cv.findUnique({ where: { id } })
  if (!cv || cv.userId !== ctx.user?.id) {
    throw new GraphQLError(messages.cvNotFound, { extensions: { code: 'NOT_FOUND' } })
  }
  return cv
}

export async function getMyCv(ctx: Context) {
  if (!ctx.user) return null
  return ctx.prisma.cv.findFirst({
    where: { userId: ctx.user.id },
    orderBy: { createdAt: 'desc' },
  })
}

// Registers the uploaded file, then synchronously extracts its content via the LLM.
export async function createCv(ctx: Context, input: unknown) {
  const parsed = createCvSchema.safeParse(input)
  if (!parsed.success) badInput(messages.cvUploadInvalid)

  const userId = ctx.user!.id
  let cv = await ctx.prisma.cv.create({
    data: { userId, ...parsed.data, status: 'EXTRACTING' },
  })

  try {
    const filePath = publicUrlToFilePath(cv.pdfUrl!)
    const buffer = await fs.readFile(filePath)
    const { text } = await pdf(buffer)

    const { content } = await callLLM({
      messages: [{ role: 'system', content: buildExtractionPrompt(text) }],
      temperature: 0.1,
      maxTokens: 3000,
      jsonMode: true,
    })

    const extractedData = parseExtractionResult(content)
    cv = await ctx.prisma.cv.update({
      where: { id: cv.id },
      data: { status: 'EXTRACTED', extractedData: extractedData as never },
    })
  } catch (err) {
    await ctx.prisma.cv.update({ where: { id: cv.id }, data: { status: 'EXTRACTION_FAILED' } })
    const detail = err instanceof LLMError ? err.attempts.map((a) => a.error).join('; ') : String(err)
    console.error('[cvService] extraction failed:', detail)
    throw new GraphQLError(messages.cvExtractionFailed, { extensions: { code: 'CV_EXTRACTION_FAILED' } })
  }

  return cv
}

// Runs the ATS optimization prompt against an already-extracted CV. When `jobContext`
// is provided, the optimization is tailored to that specific offer; otherwise it is general.
export async function optimizeCv(
  ctx: Context,
  id: string,
  template?: CvTemplateKey | null,
  jobContextInput?: unknown,
) {
  let cv = await getOwnedCv(ctx, id)
  if (!cv.extractedData) {
    throw new GraphQLError(messages.cvOptimizationRequiresExtraction, { extensions: { code: 'BAD_USER_INPUT' } })
  }

  let jobContext: CvJobContext | null = null
  if (jobContextInput != null) {
    const parsed = jobContextSchema.safeParse(jobContextInput)
    if (!parsed.success) badInput(messages.cvUploadInvalid)
    jobContext = parsed.data
  }

  // Use the newly chosen format, else fall back to the one already stored, else ATS.
  const chosenTemplate = (template ?? (cv.template as CvTemplateKey | null) ?? 'ATS') as CvTemplateKey

  cv = await ctx.prisma.cv.update({ where: { id }, data: { status: 'OPTIMIZING', template: chosenTemplate } })

  try {
    const profile = await ctx.prisma.profile.findUnique({ where: { userId: ctx.user!.id } })

    const { content } = await callLLM({
      messages: [{ role: 'system', content: buildOptimizationPrompt(profile, cv.extractedData, jobContext) }],
      temperature: 0.3,
      maxTokens: 6000,
      jsonMode: true,
    })

    const { optimizedData, improvements } = parseOptimizationResult(content)
    cv = await ctx.prisma.cv.update({
      where: { id },
      data: { status: 'OPTIMIZED', optimizedData: optimizedData as never, improvements: improvements as never },
    })
  } catch (err) {
    await ctx.prisma.cv.update({ where: { id }, data: { status: 'OPTIMIZATION_FAILED' } })
    const detail = err instanceof LLMError ? err.attempts.map((a) => a.error).join('; ') : String(err)
    console.error('[cvService] optimization failed:', detail)
    throw new GraphQLError(messages.cvOptimizationFailed, { extensions: { code: 'CV_OPTIMIZATION_FAILED' } })
  }

  return cv
}

// Persists the candidate's chosen layout without re-running the optimizer (layout is client-side).
export async function setCvTemplate(ctx: Context, id: string, template: CvTemplateKey) {
  await getOwnedCv(ctx, id)
  return ctx.prisma.cv.update({ where: { id }, data: { template } })
}

// Patches user-edited fields into the extracted data blob.
export async function updateCvDetails(ctx: Context, id: string, input: unknown) {
  const parsed = updateCvDetailsSchema.safeParse(input)
  if (!parsed.success) badInput(messages.cvUploadInvalid)

  const cv = await getOwnedCv(ctx, id)
  const extractedData = { ...(cv.extractedData as object | null), ...parsed.data }

  return ctx.prisma.cv.update({
    where: { id },
    data: { extractedData: extractedData as never },
  })
}
