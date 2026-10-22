import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  candidateDomains,
  companyKeywords,
  domainOf,
  MAX_CANDIDATE_DOMAINS,
  slugWords,
  textMentionsCompany,
} from '../companyDomains.js'

describe('slugWords', () => {
  it('strips accents, casing and punctuation', () => {
    assert.deepEqual(slugWords('Société Générale & Cie'), ['societe', 'generale', 'cie'])
  })
})

describe('companyKeywords', () => {
  it('drops legal forms and filler words that never appear in a domain', () => {
    assert.deepEqual(companyKeywords('Delys SAS'), ['delys'])
    assert.deepEqual(companyKeywords('Groupe Le Cèdre'), ['cedre'])
  })

  it('returns nothing for a name made entirely of noise', () => {
    assert.deepEqual(companyKeywords('SAS Groupe'), [])
  })
})

describe('candidateDomains', () => {
  it('proposes joined, hyphenated and first-word bases across the supported TLDs', () => {
    const domains = candidateDomains('Maison Jacquemus')
    assert.ok(domains.includes('maisonjacquemus.fr'))
    assert.ok(domains.includes('maison-jacquemus.com'))
    assert.ok(domains.includes('maison.fr'))
  })

  it('tries the most probable suffix for every base before a less probable one', () => {
    // The cap would otherwise be spent on one base's unlikely suffixes, leaving
    // 'name.fr' for the other candidates unprobed.
    const domains = candidateDomains('Maison Jacquemus')
    const lastFr = domains.lastIndexOf(domains.find((domain) => domain.endsWith('.fr'))!)
    const firstCom = domains.indexOf(domains.find((domain) => domain.endsWith('.com'))!)
    assert.ok(firstCom > lastFr)
  })

  it('drops the legal form so the likely domain is proposed first', () => {
    assert.equal(candidateDomains('Delys SAS')[0], 'delys.fr')
    assert.ok(!candidateDomains('Delys SAS').some((domain) => domain.includes('sas')))
  })

  it('caps the number of candidates so one offer cannot fan out indefinitely', () => {
    assert.ok(candidateDomains('Alpha Beta Gamma Delta Epsilon').length <= MAX_CANDIDATE_DOMAINS)
  })

  it('returns nothing when no meaningful word survives', () => {
    assert.deepEqual(candidateDomains('SAS'), [])
    assert.deepEqual(candidateDomains(''), [])
  })

  it('skips bases that are too short to be a real domain', () => {
    assert.equal(candidateDomains('E DF').some((domain) => domain.startsWith('e.')), false)
  })
})

describe('domainOf', () => {
  it('reduces a website to its bare hostname', () => {
    assert.equal(domainOf('https://www.acme.fr/contact'), 'acme.fr')
    assert.equal(domainOf('acme.fr'), 'acme.fr')
  })

  it('returns null for values that are not URLs', () => {
    assert.equal(domainOf(''), null)
  })
})

describe('textMentionsCompany', () => {
  it('accepts a page that clearly belongs to the company', () => {
    assert.equal(textMentionsCompany('Bienvenue chez Delys, conseil en data.', 'Delys'), true)
  })

  it('rejects an unrelated page that merely shares a TLD candidate', () => {
    assert.equal(textMentionsCompany('Vente de pièces automobiles à Lille.', 'Delys'), false)
  })

  it('accepts an accented page for an unaccented name', () => {
    assert.equal(textMentionsCompany('Le Cèdre accompagne les associations.', 'Le Cedre'), true)
  })

  it('rejects when the company name carries no comparable word', () => {
    assert.equal(textMentionsCompany('Anything at all', 'SAS'), false)
  })
})
