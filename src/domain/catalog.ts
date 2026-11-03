export interface PrintingVariant {
  type: string
  subtype?: string
  size?: string
  stamps?: string[]
  variantId?: string
}

export interface CatalogVariants {
  flags?: Partial<Record<'normal' | 'holo' | 'reverse' | 'firstEdition' | 'wPromo', boolean>>
  detailed?: PrintingVariant[]
}

export interface CatalogReference {
  provider: 'tcgdex'
  language: 'en'
  cardId: string
  setId: string
  collectorNumber: string
  snapshot: {
    imageBaseUrl?: string
    illustrator?: string
    dexIds?: number[]
    variants?: CatalogVariants
    setLogoUrl?: string
    setSymbolUrl?: string
    releaseDate?: string
    seriesId?: string
  }
}

export class CatalogDataError extends Error {}
export function check(value: unknown, message: string): asserts value {
  if (!value) throw new CatalogDataError(message)
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
export function record(value: unknown): Record<string, unknown> {
  check(isRecord(value), 'Invalid catalog record.')
  return value
}
export function text(value: unknown): string {
  check(typeof value === 'string' && value.trim(), 'Invalid catalog text.')
  return value
}
export function list(value: unknown): unknown[] {
  check(Array.isArray(value), 'Invalid catalog list.')
  return value
}
export function optionalText(value: unknown): string | undefined {
  return value === undefined || value === null ? undefined : text(value)
}
export function assetUrl(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const source = text(value)
  let url: URL
  try { url = new URL(source) } catch (error) {
    if (!(error instanceof TypeError)) throw error
    throw new CatalogDataError('Invalid TCGdex artwork URL.')
  }
  check(url.protocol === 'https:' && url.hostname === 'assets.tcgdex.net' && !url.port &&
    !url.username && !url.password && !url.search && !url.hash, 'Invalid TCGdex artwork URL.')
  return url.href.replace(/\/$/, '')
}
export function dexIds(value: unknown): number[] | undefined {
  if (value === undefined || value === null) return undefined
  return list(value).map((id) => {
    check(typeof id === 'number' && Number.isSafeInteger(id) && id > 0, 'Invalid Pokedex identifier.')
    return id
  })
}

export function parseVariants(value: unknown): CatalogVariants | undefined {
  if (value === undefined || value === null) return undefined
  const data = record(value)
  const result: CatalogVariants = {}
  if (data.flags !== undefined) {
    const flags = record(data.flags)
    result.flags = {}
    for (const key of ['normal', 'holo', 'reverse', 'firstEdition', 'wPromo'] as const) {
      if (flags[key] !== undefined) {
        check(typeof flags[key] === 'boolean', 'Invalid variant flag.')
        result.flags[key] = flags[key]
      }
    }
  }
  if (data.detailed !== undefined) {
    result.detailed = list(data.detailed).map((value) => {
      const variant = record(value)
      return {
        type: text(variant.type), subtype: optionalText(variant.subtype),
        size: optionalText(variant.size), variantId: optionalText(variant.variantId),
        stamps: variant.stamps === undefined ? undefined : list(variant.stamps).map(text),
      }
    })
  }
  return result
}

export function parseCatalogReference(value: unknown): CatalogReference {
  const data = record(value), snapshot = record(data.snapshot)
  check(data.provider === 'tcgdex' && data.language === 'en', 'Unsupported catalog provider or language.')
  const cardId = text(data.cardId), setId = text(data.setId), collectorNumber = text(data.collectorNumber)
  check(cardId === `${setId}-${collectorNumber}`, 'Catalog identity does not match its set and collector number.')
  check(!('image' in snapshot) && !('dataUrl' in snapshot), 'Unexpected image data in catalog snapshot.')
  return {
    provider: 'tcgdex', language: 'en', cardId, setId, collectorNumber,
    snapshot: {
      imageBaseUrl: assetUrl(snapshot.imageBaseUrl), illustrator: optionalText(snapshot.illustrator),
      dexIds: dexIds(snapshot.dexIds), variants: parseVariants(snapshot.variants),
      setLogoUrl: assetUrl(snapshot.setLogoUrl), setSymbolUrl: assetUrl(snapshot.setSymbolUrl),
      releaseDate: optionalText(snapshot.releaseDate), seriesId: optionalText(snapshot.seriesId),
    },
  }
}

const generationRanges = [
  [1, 151, 'I'], [152, 251, 'II'], [252, 386, 'III'], [387, 493, 'IV'],
  [494, 649, 'V'], [650, 721, 'VI'], [722, 809, 'VII'], [810, 905, 'VIII'], [906, 1025, 'IX'],
] as const

export function generationsFromDex(ids: readonly number[] = []): string[] {
  return generationRanges.filter(([min, max]) => ids.some((id) => Number.isInteger(id) && id >= min && id <= max))
    .map(([, , generation]) => generation)
}
