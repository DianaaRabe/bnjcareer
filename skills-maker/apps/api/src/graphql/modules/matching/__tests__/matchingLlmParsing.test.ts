import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseJobMatchResult } from '../matchingLlmParsing.js'

describe('parseJobMatchResult', () => {
  it('normalizes a well-formed response', () => {
    const result = parseJobMatchResult(
      JSON.stringify({
        score: 82,
        summary: '  Profil aligné sur le poste  ',
        strengths: ['5 ans en électricité industrielle'],
        gaps: ['Habilitation B2V absente'],
        tips: ['Remonter les chantiers CRIT en tête de CV'],
      }),
    )

    assert.equal(result.score, 82)
    assert.equal(result.summary, 'Profil aligné sur le poste')
    assert.deepEqual(result.gaps, ['Habilitation B2V absente'])
  })

  it('clamps and rounds scores returned outside 0-100', () => {
    assert.equal(parseJobMatchResult('{"score": 120}').score, 100)
    assert.equal(parseJobMatchResult('{"score": -5}').score, 0)
    assert.equal(parseJobMatchResult('{"score": 78.6}').score, 79)
    assert.equal(parseJobMatchResult('{"score": "82%"}').score, 82)
  })

  it('falls back to empty lists when the model skips or malforms a field', () => {
    const result = parseJobMatchResult('{"score": 40, "strengths": "beaucoup", "tips": [1, "Ajouter le CACES"]}')

    assert.deepEqual(result.strengths, [])
    assert.deepEqual(result.gaps, [])
    assert.deepEqual(result.tips, ['Ajouter le CACES'])
    assert.equal(result.summary, '')
  })

  it('caps each list so the panel stays readable', () => {
    const tips = ['a', 'b', 'c', 'd', 'e', 'f']
    const result = parseJobMatchResult(JSON.stringify({ score: 50, tips }))

    assert.equal(result.tips.length, 4)
  })

  it('drops repeated items rather than rendering the same bullet twice', () => {
    const result = parseJobMatchResult(
      JSON.stringify({ score: 50, tips: ['Ajouter le CACES', ' Ajouter le CACES ', 'Remonter les chantiers'] }),
    )

    assert.deepEqual(result.tips, ['Ajouter le CACES', 'Remonter les chantiers'])
  })

  it('throws instead of passing an unusable answer off as a 0% verdict', () => {
    assert.throws(() => parseJobMatchResult('{}'))
    assert.throws(() => parseJobMatchResult('{"compatibility": 88, "resume": "bon profil"}'))
  })

  it('keeps a genuine zero score when the model explains it', () => {
    const result = parseJobMatchResult('{"score": 0, "summary": "Métier sans rapport avec le CV"}')

    assert.equal(result.score, 0)
    assert.equal(result.summary, 'Métier sans rapport avec le CV')
  })

  it('reports an unusable score as null, never a fabricated 0, when analysis is present', () => {
    // A degraded model that answers with text but no parseable score must NOT be read as a 0%
    // match: a 0 would silently fail every minMatchScore gate and make the engine prepare nothing
    // while still counting the job as "matched". null is the signal that routes it to review.
    const missing = parseJobMatchResult('{"summary": "Analyse partielle", "gaps": ["Expérience"]}')
    assert.equal(missing.score, null)
    assert.equal(missing.summary, 'Analyse partielle')

    const unparseable = parseJobMatchResult('{"score": "N/A", "summary": "Analyse partielle"}')
    assert.equal(unparseable.score, null)
  })
})
