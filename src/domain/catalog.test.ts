import { describe, expect, it } from 'vitest'
import { generationsFromDex, parseCatalogReference } from './catalog'
import { addCopies, emptyCollection, emptyCopyFilters, filterCopies, projectCards } from './collection'

describe('catalog metadata', () => {
  it.each(['004', 'TG01'])('preserves string collector number %s and variant meaning', (collectorNumber) => {
    const catalog = parseCatalogReference({
      provider: 'tcgdex', language: 'en', cardId: `sv-1-${collectorNumber}`, setId: 'sv-1', collectorNumber,
      snapshot: { variants: { flags: { normal: false, holo: true }, detailed: [{ type: 'holo', subtype: 'unlimited', stamps: ['1st-edition'], size: 'standard', variantId: 'v1' }] } },
    })
    const state = addCopies(emptyCollection(), { name: 'Test', set: 'Example', type: 'Pokemon', rarity: 'Rare', notes: '', quantity: 2, catalog })
    expect(projectCards(state)[0]).toMatchObject({ rarity: 'Rare', quantity: 2, catalog: { collectorNumber, snapshot: { variants: catalog.snapshot.variants } } })
    expect(state.entries[0].id).not.toBe(catalog.cardId)
    expect(state.copies.every((copy) => copy.valueCents === null)).toBe(true)
  })

  it('keeps absent optional metadata unknown and rejects inconsistent identity', () => {
    const reference = { provider: 'tcgdex', language: 'en', cardId: 'base1-4', setId: 'base1', collectorNumber: '4', snapshot: {} }
    expect(parseCatalogReference(reference).snapshot.variants).toBeUndefined()
    expect(() => parseCatalogReference({ ...reference, collectorNumber: '004' })).toThrow(/identity/)
  })

  it('maps supported main dex IDs without guessing or duplicating generations', () => {
    expect(generationsFromDex([6, 25, 151, 152, 905, 906, 1025, 1026, 0, 1.5])).toEqual(['I', 'II', 'VIII', 'IX'])
    expect(generationsFromDex()).toEqual([])
    expect(generationsFromDex([9999])).toEqual([])
  })

  it('filters exact broad rarities without mutating copies or conflating None and unknown', () => {
    let state = emptyCollection()
    for (const rarity of [undefined, 'None', 'Illustration rare', 'Common', 'Holo Rare']) {
      state = addCopies(state, { name: 'Card', set: '', type: 'Pokemon', rarity, quantity: 1, notes: '' })
    }
    const before = JSON.stringify(state)
    for (const rarity of ['None', 'Illustration rare', 'Common', 'Holo Rare']) {
      expect(filterCopies(state, { ...emptyCopyFilters, rarity })).toHaveLength(1)
    }
    expect(filterCopies(state, emptyCopyFilters)).toHaveLength(5)
    expect(JSON.stringify(state)).toBe(before)
  })
})
