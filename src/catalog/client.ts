import {
  assetUrl, check, dexIds, generationsFromDex, list, optionalText, parseVariants, record, text,
} from '../domain/catalog'
import { cardTypes, elementalTypes, type NewCard } from '../domain/collection'

export interface CatalogSet { id: string; name: string; seriesId: string }
export interface CardSummary {
  id: string
  name: string
  collectorNumber: string
  imageBaseUrl?: string
  set: CatalogSet
}
export interface SearchPage { cards: CardSummary[]; nextPage: number | null }
export interface CatalogClient {
  sets(signal: AbortSignal): Promise<CatalogSet[]>
  search(query: string, setId: string, page: number, signal: AbortSignal): Promise<SearchPage>
  card(id: string, signal: AbortSignal): Promise<NewCard>
}

export const apiEndpoint = 'https://api.tcgdex.net/v2/en'
export const pageSize = 24

export function createCatalogClient(request: typeof fetch = (...args) => fetch(...args)): CatalogClient {
  let index: CatalogSet[] | undefined
  const details = new Map<string, NewCard>()
  async function get(path: string, signal: AbortSignal): Promise<unknown> {
    signal.throwIfAborted()
    const response = await request(`${apiEndpoint}/${path}`, { signal })
    if (!response.ok) throw new Error(`TCGdex request failed (${response.status}). Please retry or use manual entry.`)
    return response.json()
  }
  async function allSets(signal: AbortSignal): Promise<CatalogSet[]> {
    signal.throwIfAborted()
    if (index) return index
    const series = list(await get('series', signal)).map((item) => text(record(item).id))
    const groups = await Promise.all(series.map(async (seriesId) => {
      const data = record(await get(`series/${encodeURIComponent(seriesId)}`, signal))
      check(data.id === seriesId, 'Unexpected catalog series.')
      return list(data.sets).map((value): CatalogSet => {
        const set = record(value)
        return { id: text(set.id), name: text(set.name), seriesId }
      })
    }))
    const sets = groups.flat()
    check(new Set(sets.map((set) => set.id)).size === sets.length, 'Duplicate catalog sets.')
    signal.throwIfAborted()
    index = sets
    return sets
  }
  function summary(value: unknown, sets: CatalogSet[]): CardSummary {
    const data = record(value), id = text(data.id), collectorNumber = text(data.localId)
    const set = sets.filter((set) => id.startsWith(`${set.id}-`)).sort((a, b) => b.id.length - a.id.length)[0]
    check(set && id === `${set.id}-${collectorNumber}`, `Cannot resolve physical membership for card ${id}.`)
    return { id, collectorNumber, name: text(data.name), imageBaseUrl: assetUrl(data.image), set }
  }
  return {
    async sets(signal) {
      return (await allSets(signal)).filter((set) => set.seriesId !== 'tcgp').sort((a, b) => a.name.localeCompare(b.name))
    },
    async search(query, setId, page, signal) {
      check(Number.isSafeInteger(page) && page >= 1, 'Invalid catalog page.')
      const sets = await allSets(signal)
      check(!setId || sets.some((set) => set.id === setId && set.seriesId !== 'tcgp'), 'Choose a physical card set.')
      let cursor = page
      while (true) {
        const params = new URLSearchParams({
          'pagination:page': String(cursor), 'pagination:itemsPerPage': String(pageSize),
        })
        if (query.trim()) params.set('name', query.trim())
        if (setId) params.set('set.id', `eq:${setId}`)
        const raw = list(await get(`cards?${params}`, signal))
        const cards = raw.map((value) => summary(value, sets)).filter((card) => card.set.seriesId !== 'tcgp')
        check(!setId || cards.every((card) => card.set.id === setId), 'Catalog returned a card outside the selected set.')
        const nextPage = raw.length < pageSize ? null : cursor + 1
        if (cards.length || nextPage === null) return { cards, nextPage }
        cursor++
      }
    },
    async card(id, signal) {
      signal.throwIfAborted()
      const cached = details.get(id)
      if (cached) return structuredClone(cached)
      const sets = await allSets(signal)
      const data = record(await get(`cards/${encodeURIComponent(id)}`, signal))
      const item = summary(data, sets), set = record(data.set)
      check(item.id === id && item.set.seriesId !== 'tcgp' && set.id === item.set.id, 'Selected card is not a matching physical card.')
      const type = cardTypes.find((type) => type === data.category)
      check(type, 'Unsupported catalog card category.')
      const types = data.types === undefined || data.types === null ? [] : list(data.types).map((value) => {
        const type = elementalTypes.find((type) => type === value)
        check(type, 'Unsupported catalog elemental type.')
        return type
      })
      const ids = dexIds(data.dexId)
      const legacyVariants = data.variants === undefined || data.variants === null || Array.isArray(data.variants)
        ? undefined : record(data.variants)
      const detailed = data.variants_detailed ?? (Array.isArray(data.variants) ? data.variants : undefined)
      const variants = legacyVariants !== undefined || detailed !== undefined ? parseVariants({
        flags: legacyVariants,
        detailed: detailed === undefined ? undefined : list(detailed).map((value) => {
          const variant = record(value)
          return { type: variant.type, subtype: variant.subtype, size: variant.size, variantId: variant.variantId, stamps: variant.stamp }
        }),
      }) : undefined
      const card: NewCard = {
        name: item.name, set: text(set.name), type, rarity: optionalText(data.rarity),
        elementalTypes: types, generations: generationsFromDex(ids), notes: '', quantity: 1,
        catalog: {
          provider: 'tcgdex', language: 'en', cardId: id, setId: item.set.id, collectorNumber: item.collectorNumber,
          snapshot: {
            imageBaseUrl: item.imageBaseUrl, illustrator: optionalText(data.illustrator), dexIds: ids, variants,
            setLogoUrl: assetUrl(set.logo), setSymbolUrl: assetUrl(set.symbol),
            seriesId: item.set.seriesId, releaseDate: optionalText(set.releaseDate),
          },
        },
      }
      signal.throwIfAborted()
      details.set(id, structuredClone(card))
      return card
    },
  }
}

export const catalogClient = createCatalogClient()
