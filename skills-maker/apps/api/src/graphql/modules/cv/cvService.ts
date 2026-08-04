import fs from 'node:fs/promises'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import pdf from 'pdf-parse'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import { callLLM, LLMError } from '@/lib/llmClient.js'
import { CV_MAX_FILE_SIZE_BYTES, publicUrlToFilePath } from '@/lib/uploadStorage.js'
import { buildExtractionPrompt, buildOptimizationPrompt } from './cvPrompts.js'
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

// Runs the ATS optimization prompt against an already-extracted CV.
export async function optimizeCv(ctx: Context, id: string) {
  let cv = await getOwnedCv(ctx, id)
  if (!cv.extractedData) {
    throw new GraphQLError(messages.cvOptimizationRequiresExtraction, { extensions: { code: 'BAD_USER_INPUT' } })
  }

  cv = await ctx.prisma.cv.update({ where: { id }, data: { status: 'OPTIMIZING' } })

  try {
    const profile = await ctx.prisma.profile.findUnique({ where: { userId: ctx.user!.id } })

    const { content } = await callLLM({
      messages: [{ role: 'system', content: buildOptimizationPrompt(profile, cv.extractedData) }],
      temperature: 0.3,
      maxTokens: 6000,
      jsonMode: true,
    })

    const { optimizedHtml, improvements } = parseOptimizationResult(content)
    cv = await ctx.prisma.cv.update({
      where: { id },
      data: { status: 'OPTIMIZED', optimizedHtml, improvements: improvements as never },
    })
  } catch (err) {
    await ctx.prisma.cv.update({ where: { id }, data: { status: 'OPTIMIZATION_FAILED' } })
    const detail = err instanceof LLMError ? err.attempts.map((a) => a.error).join('; ') : String(err)
    console.error('[cvService] optimization failed:', detail)
    throw new GraphQLError(messages.cvOptimizationFailed, { extensions: { code: 'CV_OPTIMIZATION_FAILED' } })
  }

  return cv
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
