import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { assertPublicUrl, isBlockedAddress, UnsafeUrlError } from '../safeFetch.js'

describe('isBlockedAddress', () => {
  it('blocks the cloud metadata endpoint and link-local range', () => {
    // 169.254.169.254 is the credential-theft target an SSRF is usually aimed at.
    assert.equal(isBlockedAddress('169.254.169.254'), true)
    assert.equal(isBlockedAddress('169.254.0.1'), true)
  })

  it('blocks loopback, unspecified and private ranges', () => {
    for (const address of ['127.0.0.1', '127.1.2.3', '0.0.0.0', '10.0.0.1', '172.16.0.1', '172.31.255.255', '192.168.1.1']) {
      assert.equal(isBlockedAddress(address), true, address)
    }
  })

  it('blocks CGNAT, benchmarking, multicast and reserved ranges', () => {
    for (const address of ['100.64.0.1', '100.127.255.255', '198.18.0.1', '224.0.0.1', '240.0.0.1', '255.255.255.255']) {
      assert.equal(isBlockedAddress(address), true, address)
    }
  })

  it('blocks IPv6 loopback, unique-local and link-local addresses', () => {
    for (const address of ['::1', '::', 'fc00::1', 'fd12:3456::1', 'fe80::1', 'ff02::1']) {
      assert.equal(isBlockedAddress(address), true, address)
    }
  })

  it('blocks IPv4-mapped IPv6 forms of a private address', () => {
    assert.equal(isBlockedAddress('::ffff:10.0.0.1'), true)
    assert.equal(isBlockedAddress('::ffff:169.254.169.254'), true)
  })

  it('allows genuinely public addresses', () => {
    for (const address of ['8.8.8.8', '1.1.1.1', '93.184.216.34', '151.101.1.69', '2001:4860:4860::8888']) {
      assert.equal(isBlockedAddress(address), false, address)
    }
  })

  it('treats unparseable values as blocked rather than trusting them', () => {
    assert.equal(isBlockedAddress(''), true)
    assert.equal(isBlockedAddress('999.999.999.999'), true)
  })
})

describe('assertPublicUrl', () => {
  it('rejects non-http schemes', async () => {
    await assert.rejects(() => assertPublicUrl('ftp://acme.fr/'), UnsafeUrlError)
    await assert.rejects(() => assertPublicUrl('file:///etc/passwd'), UnsafeUrlError)
  })

  it('rejects malformed values', async () => {
    await assert.rejects(() => assertPublicUrl('not a url'), UnsafeUrlError)
  })

  it('rejects non-web ports', async () => {
    await assert.rejects(() => assertPublicUrl('http://acme.fr:8080/'), UnsafeUrlError)
    await assert.rejects(() => assertPublicUrl('http://acme.fr:22/'), UnsafeUrlError)
    await assert.rejects(() => assertPublicUrl('http://acme.fr:5432/'), UnsafeUrlError)
  })

  it('rejects a metadata hostname without contacting it', async () => {
    await assert.rejects(() => assertPublicUrl('http://169.254.169.254/latest/meta-data/'), UnsafeUrlError)
    await assert.rejects(() => assertPublicUrl('http://localhost:80/'), UnsafeUrlError)
    await assert.rejects(() => assertPublicUrl('http://metadata.google.internal/'), UnsafeUrlError)
  })

  it('rejects an IPv6 literal pointing at loopback', async () => {
    await assert.rejects(() => assertPublicUrl('http://[::1]/'), UnsafeUrlError)
  })
})
