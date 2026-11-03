import { describe, expect, it, vi } from 'vitest'
import { apiEndpoint, createCatalogClient, pageSize } from './client'

const signal = () => new AbortController().signal
const brief = (id = 'base1-4', localId = '4') => ({ id, localId, name: 'Charizard' })
const detail = {
  ...brief(), set: { id: 'base1', name: 'Base Set' }, category: 'Pokemon', rarity: 'Rare',
  image: 'https://assets.tcgdex.net/en/base/base1/4', dexId: [6], types: ['Fire'],
  variants: { holo: true, normal: false },
  variants_detailed: [{ type: 'holo', subtype: 'unlimited', stamp: ['1st-edition'], variantId: 'v1', pricing: { value: 100 } }],
  pricing: { cardmarket: { trend: 100 } },
}
function mockRequest(routes: Record<string, unknown> = {}) {
  return vi.fn<typeof fetch>(async (url, init) => {
    init?.signal?.throwIfAborted()
    const path = String(url).slice(apiEndpoint.length + 1)
    const defaults: Record<string, unknown> = {
      series: [{ id: 'base' }, { id: 'tcgp' }],
      'series/base': { id: 'base', sets: [{ id: 'base1', name: 'Base Set' }, { id: 'tk-hs-r', name: 'Trainer Kit' }, { id: 'tk', name: 'Other Kit' }] },
      'series/tcgp': { id: 'tcgp', sets: [{ id: 'A1', name: 'Digital' }] },
      'cards/base1-4': detail,
    }
    if (path in routes || path in defaults) return new Response(JSON.stringify(path in routes ? routes[path] : defaults[path]))
    throw new Error(`Unexpected request: ${path}`)
  })
}
const pathFor = (page: number, query = '', set = '') => {
  const params = new URLSearchParams({ 'pagination:page': String(page), 'pagination:itemsPerPage': String(pageSize) })
  if (query) params.set('name', query)
  if (set) params.set('set.id', `eq:${set}`)
  return `cards?${params}`
}

describe('TCGdex adapter', () => {
  it('uses physical series membership and caches validated indexes and details', async () => {
    const request = mockRequest(), client = createCatalogClient(request)
    expect((await client.sets(signal())).map((set) => set.id)).toEqual(['base1', 'tk', 'tk-hs-r'])
    const card = await client.card('base1-4', signal())
    expect(card).toMatchObject({
      rarity: 'Rare', generations: ['I'], elementalTypes: ['Fire'],
      catalog: { collectorNumber: '4', snapshot: { variants: { flags: { normal: false, holo: true }, detailed: [{ type: 'holo', stamps: ['1st-edition'], variantId: 'v1' }] } } },
    })
    expect(JSON.stringify(card)).not.toContain('pricing')
    card.name = 'Edited local result'
    expect((await client.card('base1-4', signal())).name).toBe('Charizard')
    await client.sets(signal())
    expect(request).toHaveBeenCalledTimes(4)
  })

  it('handles missing optional metadata and array-style variants', async () => {
    const request = mockRequest({
      'cards/base1-4': { ...brief(), set: { id: 'base1', name: 'Base' }, category: 'Pokemon', variants: [{ type: 'reverse' }] },
    })
    const card = await createCatalogClient(request).card('base1-4', signal())
    expect(card.rarity).toBeUndefined()
    expect(card.catalog?.snapshot.imageBaseUrl).toBeUndefined()
    expect(card.generations).toEqual([])
    expect(card.catalog?.snapshot.variants?.detailed).toEqual([{ type: 'reverse' }])
  })

  it('filters digital cards without artwork and keeps longest matching hyphenated set ID', async () => {
    const request = mockRequest({ [pathFor(1)]: [brief('A1-004', '004'), brief('tk-hs-r-TG01', 'TG01')] })
    const result = await createCatalogClient(request).search('', '', 1, signal())
    expect(result.nextPage).toBeNull()
    expect(result.cards).toHaveLength(1)
    expect(result.cards[0]).toMatchObject({ collectorNumber: 'TG01', set: { id: 'tk-hs-r' }, imageBaseUrl: undefined })
  })

  it('advances past full digital-only pages and preserves the provider cursor', async () => {
    const digital = Array.from({ length: pageSize }, (_, i) => brief(`A1-${i}`, String(i)))
    const request = mockRequest({
      [pathFor(1)]: digital, [pathFor(2)]: digital,
      [pathFor(3)]: [...digital.slice(1), brief()], [pathFor(4)]: [],
    })
    const client = createCatalogClient(request)
    const page = await client.search('', '', 1, signal())
    expect(page.cards).toHaveLength(1)
    expect(page.nextPage).toBe(4)
    expect(await client.search('', '', page.nextPage!, signal())).toEqual({ cards: [], nextPage: null })
    expect(new URL(String(request.mock.calls.at(-1)?.[0])).searchParams.get('pagination:itemsPerPage')).toBe(String(pageSize))
  })

  it('supports set filtering and ends on a short provider page', async () => {
    const request = mockRequest({ [pathFor(1, 'Char', 'base1')]: [brief()] })
    const page = await createCatalogClient(request).search('Char', 'base1', 1, signal())
    expect(page.cards[0].set.id).toBe('base1')
    expect(page.nextPage).toBeNull()
  })

  it.each([
    { [pathFor(1)]: [brief('missing-4')] },
    { [pathFor(1)]: { invalid: true } },
    { [pathFor(1)]: [{ ...brief(), image: 'data:image/png;base64,abc' }] },
    { [pathFor(1)]: [{ ...brief(), localId: 4 }] },
  ])('reports malformed results or unresolved membership', async (routes) => {
    await expect(createCatalogClient(mockRequest(routes)).search('', '', 1, signal())).rejects.toThrow()
  })

  it('rejects digital detail, mismatched identity and unsupported category/types', async () => {
    for (const data of [
      { ...detail, id: 'A1-4', set: { id: 'A1', name: 'Digital' } },
      { ...detail, id: 'base1-5' },
      { ...detail, category: 'Other' },
      { ...detail, types: ['Unknown future type'] },
    ]) {
      await expect(createCatalogClient(mockRequest({ 'cards/base1-4': data })).card('base1-4', signal())).rejects.toThrow()
    }
  })

  it('surfaces HTTP failures, retries failed indexes, and propagates aborts', async () => {
    const request = mockRequest()
    request.mockResolvedValueOnce(new Response('unavailable', { status: 503 }))
    const client = createCatalogClient(request)
    await expect(client.sets(signal())).rejects.toThrow(/503/)
    expect(await client.sets(signal())).toHaveLength(3)
    const controller = new AbortController()
    controller.abort()
    await expect(client.card('base1-4', controller.signal)).rejects.toThrow(/aborted/i)
  })
})
