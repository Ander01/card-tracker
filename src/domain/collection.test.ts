import { describe, expect, it } from 'vitest'
import { emptyFilters, filterCards, validateCard, type Card } from './collection'

const cards: Card[] = [{ id: '1', name: 'Charizard', set: 'Base', type: 'Pokemon', rarity: 'Rare', quantity: 1, notes: 'fire favorite' }]

describe('collection domain', () => {
  it('rejects missing names and invalid quantities', () => {
    expect(validateCard({ ...cards[0], name: '', quantity: 0 })).toEqual({
      name: 'Card name is required.',
      quantity: 'Quantity must be a whole number greater than zero.',
    })
  })

  it('filters by name and metadata without changing the source collection', () => {
    expect(filterCards(cards, { ...emptyFilters, query: 'char', rarity: 'Rare' })).toEqual(cards)
    expect(filterCards(cards, { ...emptyFilters, type: 'Trainer' })).toEqual([])
    expect(cards).toHaveLength(1)
  })
})
