export const cardTypes = ['Pokemon', 'Trainer', 'Energy'] as const
export const rarities = ['Common', 'Uncommon', 'Rare', 'Holo Rare', 'Ultra Rare'] as const

export type CardType = (typeof cardTypes)[number]
export type Rarity = (typeof rarities)[number]

export interface Card {
  id: string
  name: string
  set: string
  type: CardType
  rarity: Rarity
  quantity: number
  notes: string
}

export type NewCard = Omit<Card, 'id'>

export interface CardFilters {
  query: string
  set: string
  type: string
  rarity: string
}

export const emptyFilters: CardFilters = { query: '', set: '', type: '', rarity: '' }

export function validateCard(card: NewCard): Partial<Record<keyof NewCard, string>> {
  const errors: Partial<Record<keyof NewCard, string>> = {}
  if (!card.name.trim()) errors.name = 'Card name is required.'
  if (!Number.isInteger(card.quantity) || card.quantity < 1) {
    errors.quantity = 'Quantity must be a whole number greater than zero.'
  }
  return errors
}

export function filterCards(cards: Card[], filters: CardFilters): Card[] {
  const query = filters.query.trim().toLowerCase()
  return cards.filter((card) => {
    const matchesQuery = !query || card.name.toLowerCase().includes(query)
    const matchesSet = !filters.set || card.set === filters.set
    const matchesType = !filters.type || card.type === filters.type
    const matchesRarity = !filters.rarity || card.rarity === filters.rarity
    return matchesQuery && matchesSet && matchesType && matchesRarity
  })
}

export interface CardStorage {
  load(): Card[]
  save(cards: Card[]): void
}

const storageKey = 'card-tracker.collection'

export function createLocalStorage(storage: Storage = window.localStorage): CardStorage {
  return {
    load() {
      const raw = storage.getItem(storageKey)
      if (!raw) return []
      try {
        const parsed: unknown = JSON.parse(raw)
        return Array.isArray(parsed) ? (parsed as Card[]) : []
      } catch {
        return []
      }
    },
    save(cards) {
      storage.setItem(storageKey, JSON.stringify(cards))
    },
  }
}
