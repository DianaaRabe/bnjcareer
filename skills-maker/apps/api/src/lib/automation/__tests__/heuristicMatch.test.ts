import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { heuristicMatchScore } from '../heuristicMatch.js'
import type { CanonicalJob } from '../types.js'

function job(overrides: Partial<CanonicalJob>): CanonicalJob {
  return {
    id: 'src-1',
    source: 'FRANCE_TRAVAIL' as CanonicalJob['source'],
    title: '',
    company: null,
    location: '',
    description: '',
    applyUrl: 'https://example.test/1',
    postedAt: null,
    salary: null,
    tags: [],
    isRemote: false,
    canonicalKey: 'k1',
    discoveredAt: '2026-10-23T00:00:00.000Z',
    ...overrides,
  }
}

describe('heuristicMatchScore', () => {
  it('returns 0 when the candidate has no usable vocabulary', () => {
    assert.equal(heuristicMatchScore(null, null, job({ title: 'Développeur React', description: 'TypeScript Node' })), 0)
  })

  it('returns 0 when the offer carries no usable tokens', () => {
    assert.equal(heuristicMatchScore({ skills: ['React', 'TypeScript'] }, null, job({})), 0)
  })

  it('scores a relevant offer well above an irrelevant one for the same candidate', () => {
    const cv = {
      skills: ['React', 'TypeScript', 'Node', 'GraphQL', 'PostgreSQL', 'Docker'],
      titles: ['Développeur frontend'],
    }
    const relevant = job({
      title: 'Développeur React TypeScript',
      description: 'Stack React, TypeScript, GraphQL, Node et PostgreSQL. Déploiement Docker.',
    })
    const irrelevant = job({
      title: 'Boulanger',
      description: 'Préparation du pain, pétrissage, cuisson en fournil traditionnel.',
      canonicalKey: 'k2',
    })

    const relevantScore = heuristicMatchScore(cv, null, relevant)
    const irrelevantScore = heuristicMatchScore(cv, null, irrelevant)

    assert.ok(relevantScore >= 65, `relevant match should clear the default threshold, got ${relevantScore}`)
    assert.ok(relevantScore > irrelevantScore, `relevant (${relevantScore}) should beat irrelevant (${irrelevantScore})`)
  })

  it('ignores shared recruitment boilerplate so filler alone does not inflate the score', () => {
    const cv = { summary: 'Candidat avec expérience, rejoindre une équipe, poste en entreprise' }
    const boilerplate = job({
      title: 'Poste à pourvoir',
      description: 'Rejoindre notre équipe, mission au sein de l\'entreprise, profil avec expérience.',
    })
    assert.equal(heuristicMatchScore(cv, null, boilerplate), 0)
  })

  it('is stable: the same inputs always produce the same score', () => {
    const cv = { skills: ['React', 'TypeScript', 'Node'] }
    const offer = job({ title: 'React Node', description: 'TypeScript React Node' })
    assert.equal(heuristicMatchScore(cv, null, offer), heuristicMatchScore(cv, null, offer))
  })
})
