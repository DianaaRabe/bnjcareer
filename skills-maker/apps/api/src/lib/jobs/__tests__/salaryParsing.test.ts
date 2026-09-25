import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseSalary } from '../salaryParsing.js'

describe('parseSalary', () => {
  it('returns null for empty labels', () => {
    assert.equal(parseSalary(null), null)
    assert.equal(parseSalary('   '), null)
  })

  it('parses a France Travail monthly range without mistaking the instalment count for an amount', () => {
    const salary = parseSalary('Mensuel de 1800.0 Euros à 2200.0 Euros sur 12.0 mois')
    assert.deepEqual(salary, {
      label: 'Mensuel de 1800.0 Euros à 2200.0 Euros sur 12.0 mois',
      min: 1800,
      max: 2200,
      currency: 'EUR',
      period: 'MONTH',
    })
  })

  it('parses a single hourly amount', () => {
    const salary = parseSalary('Horaire de 11.88 Euros')
    assert.equal(salary?.min, 11.88)
    assert.equal(salary?.max, null)
    assert.equal(salary?.period, 'HOUR')
  })

  it('parses an annual range', () => {
    const salary = parseSalary('Annuel de 30000.0 Euros à 35000.0 Euros sur 12.0 mois')
    assert.equal(salary?.min, 30000)
    assert.equal(salary?.max, 35000)
    assert.equal(salary?.period, 'YEAR')
  })

  it('handles english thousands separators from worldwide sources', () => {
    const salary = parseSalary('$3,000 - $4,500 per month')
    assert.equal(salary?.min, 3000)
    assert.equal(salary?.max, 4500)
    assert.equal(salary?.currency, 'USD')
    assert.equal(salary?.period, 'MONTH')
  })

  it('handles french decimal commas and spaced thousands', () => {
    const salary = parseSalary('2 500,50 € par mois')
    assert.equal(salary?.min, 2500.5)
    assert.equal(salary?.currency, 'EUR')
  })

  it('keeps the label when no amount can be extracted', () => {
    const salary = parseSalary('Selon profil')
    assert.deepEqual(salary, {
      label: 'Selon profil',
      min: null,
      max: null,
      currency: null,
      period: null,
    })
  })
})
