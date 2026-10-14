import { describe, expect, it } from 'vitest'
import { suggestBinderOrder } from './suggestions'
import type { Card } from './collection'

const cards: Card[] = [
  { id: '2', name: 'Charmander', set: '', type: 'Pokemon', rarity: 'Common', quantity: 1, notes: '' },
  { id: '1', name: 'Charizard', set: '', type: 'Pokemon', rarity: 'Rare', quantity: 1, notes: 'fire' },
]

describe('binder suggestions', () => {
  it('creates a deterministic alphabetical layout', () => {
    const first = suggestBinderOrder(cards, 'fire')
    const second = suggestBinderOrder(cards, 'fire')
    expect(first).toEqual(second)
    expect(first?.cards.map((card) => card.name)).toEqual(['Charizard', 'Charmander'])
  })

  it('requires a theme and reports no matches', () => {
    expect(suggestBinderOrder(cards, '   ')).toBeNull()
    expect(suggestBinderOrder(cards, 'water')?.cards).toEqual([])
  })
})
