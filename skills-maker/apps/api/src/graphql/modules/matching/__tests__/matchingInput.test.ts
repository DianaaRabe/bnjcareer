import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { GraphQLError } from 'graphql'
import { MAX_DESCRIPTION_LENGTH, MIN_DESCRIPTION_LENGTH } from '../matchingConstants.js'
import { parseAnalyzeJobMatchInput } from '../matchingInput.js'

const description = (length: number) => 'a'.repeat(length)

function codeOf(input: unknown): string | undefined {
  try {
    parseAnalyzeJobMatchInput(input)
    return undefined
  } catch (err) {
    assert.ok(err instanceof GraphQLError)
    return String(err.extensions.code)
  }
}

describe('parseAnalyzeJobMatchInput', () => {
  it('accepts an offer at the minimum length and trims the optional fields', () => {
    const parsed = parseAnalyzeJobMatchInput({
      jobUrl: '  https://candidat.francetravail.fr/offres/recherche/detail/212KTJR  ',
      jobTitle: '  Electricien H/F  ',
      company: null,
      description: description(MIN_DESCRIPTION_LENGTH),
    })

    assert.equal(parsed.jobTitle, 'Electricien H/F')
    assert.equal(parsed.jobUrl, 'https://candidat.francetravail.fr/offres/recherche/detail/212KTJR')
    assert.equal(parsed.company, null)
  })

  it('asks for more text only when the description is actually too short', () => {
    assert.equal(codeOf({ description: description(MIN_DESCRIPTION_LENGTH - 1) }), 'MATCHING_DESCRIPTION_TOO_SHORT')
    assert.equal(codeOf({ description: '' }), 'MATCHING_DESCRIPTION_TOO_SHORT')
  })

  it('reports an oversized offer as invalid input, never as "paste more text"', () => {
    assert.equal(codeOf({ description: description(MAX_DESCRIPTION_LENGTH + 1) }), 'BAD_USER_INPUT')
  })

  it('rejects oversized optional fields without blaming the description', () => {
    const valid = description(MIN_DESCRIPTION_LENGTH)
    assert.equal(codeOf({ description: valid, jobUrl: 'x'.repeat(2001) }), 'BAD_USER_INPUT')
    assert.equal(codeOf({ description: valid, jobTitle: 'x'.repeat(301) }), 'BAD_USER_INPUT')
  })
})
