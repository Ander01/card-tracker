export const cardTypes = ['Pokemon', 'Trainer', 'Energy'] as const
export const rarities = ['Common', 'Uncommon', 'Rare', 'Holo Rare', 'Ultra Rare'] as const
export const elementalTypes = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Fairy', 'Colorless'] as const
export const generations = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'] as const

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
  elementalTypes?: string[]
  generations?: string[]
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
  if (!Number.isSafeInteger(card.quantity) || card.quantity < 1 || card.quantity > 4294967295) {
    errors.quantity = 'Quantity must be a whole number greater than zero.'
  }
  if (card.elementalTypes?.some((value) => !elementalTypes.some((type) => type === value))) errors.elementalTypes = 'Choose a supported elemental type.'
  if (card.generations?.some((value) => !generations.some((generation) => generation === value))) errors.generations = 'Choose a supported Pokemon generation.'
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

export { createLocalStorage } from './storage'

export type CardEntry = Omit<Card, 'quantity'>
export type Location =
  | { kind: 'unsorted' }
  | { kind: 'category'; categoryId: string }
  | { kind: 'binder'; binderId: string; page: number; pocket: number }
export interface OwnedCopy { id: string; entryId: string; valueCents: number | null; location: Location }
export interface Category { id: string; name: string }
export interface Binder { id: string; name: string; color: string; pageCount: number; rows: number; columns: number }
export interface CollectionState {
  version: 2
  currency: 'EUR'
  entries: CardEntry[]
  copies: OwnedCopy[]
  categories: Category[]
  binders: Binder[]
}
export class CollectionError extends Error {}
export function requireValid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new CollectionError(message)
}
export const emptyCollection = (): CollectionState => ({ version: 2, currency: 'EUR', entries: [], copies: [], categories: [], binders: [] })
export const hasUnsorted = (state: CollectionState) => state.copies.some((copy) => copy.location.kind === 'unsorted')
export const binderCapacity = (binder: Binder) => binder.pageCount * binder.rows * binder.columns

export function addCopies(state: CollectionState, draft: NewCard, entryId: string = crypto.randomUUID()): CollectionState {
  const errors = validateCard(draft)
  requireValid(Object.keys(errors).length === 0, Object.values(errors).join(' '))
  requireValid(!state.entries.some((entry) => entry.id === entryId), 'Card entry already exists.')
  const { quantity, ...metadata } = draft
  const entry: CardEntry = { ...metadata, id: entryId, name: draft.name.trim(), elementalTypes: draft.elementalTypes ?? [], generations: draft.generations ?? [] }
  return {
    ...state,
    entries: [...state.entries, entry],
    copies: [...state.copies, ...Array.from({ length: quantity }, (): OwnedCopy => ({ id: crypto.randomUUID(), entryId, valueCents: null, location: { kind: 'unsorted' } }))],
  }
}

export function projectCards(state: CollectionState): Card[] {
  const counts = new Map<string, number>()
  for (const copy of state.copies) counts.set(copy.entryId, (counts.get(copy.entryId) ?? 0) + 1)
  return state.entries.map((entry) => ({ ...entry, quantity: counts.get(entry.id) ?? 0 }))
}

export function parseEuro(value: string): number | null {
  if (!value.trim()) return null
  requireValid(/^\d+(?:[.,]\d{1,2})?$/.test(value.trim()), 'Enter a nonnegative EUR amount with at most two decimal places.')
  const [whole, fraction = ''] = value.trim().replace(',', '.').split('.')
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  requireValid(cents <= BigInt(Number.MAX_SAFE_INTEGER), 'EUR amount is too large.')
  return Number(cents)
}
export function euroInput(value: number | null) {
  if (value === null) return ''
  const cents = BigInt(value)
  return `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`
}
export function formatEuro(value: number | null) {
  if (value === null) return 'Unknown'
  const cents = BigInt(value)
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).formatToParts(cents / 100n)
    .map((part) => part.type === 'fraction' ? String(cents % 100n).padStart(2, '0') : part.value).join('')
}

export function setCopyValue(state: CollectionState, id: string, value: string): CollectionState {
  requireValid(state.copies.some((copy) => copy.id === id), 'Copy no longer exists.')
  const valueCents = parseEuro(value)
  return { ...state, copies: state.copies.map((copy) => copy.id === id ? { ...copy, valueCents } : copy) }
}

export function saveCategory(state: CollectionState, name: string, id: string = crypto.randomUUID()): CollectionState {
  const trimmed = name.trim()
  requireValid(trimmed && trimmed.toLowerCase() !== 'unsorted', 'Choose a nonempty category name other than Unsorted.')
  requireValid(!state.categories.some((category) => category.id !== id && category.name.toLowerCase() === trimmed.toLowerCase()), 'Category name already exists.')
  return { ...state, categories: [...state.categories.filter((category) => category.id !== id), { id, name: trimmed }] }
}

export function validateBinder(binder: Binder) {
  requireValid(binder.name.trim(), 'Binder name is required.')
  requireValid(/^#[0-9a-f]{6}$/i.test(binder.color), 'Choose a valid cover color.')
  requireValid([binder.pageCount, binder.rows, binder.columns, binderCapacity(binder)].every((n) => Number.isSafeInteger(n) && n > 0) && binder.rows * binder.columns <= 4294967295, 'Pages, rows and columns must be positive whole numbers within supported capacity.')
}

export function saveBinder(state: CollectionState, binder: Binder): CollectionState {
  validateBinder(binder)
  const previous = state.binders.find((item) => item.id === binder.id)
  const placed = state.copies.filter((copy) => copy.location.kind === 'binder' && copy.location.binderId === binder.id)
  requireValid(!previous || !placed.length || (previous.rows === binder.rows && previous.columns === binder.columns), 'Move all copies to bulk before changing the pocket grid.')
  requireValid(!placed.some((copy) => copy.location.kind === 'binder' && copy.location.page >= binder.pageCount), 'Move copies off the removed pages first.')
  return { ...state, binders: [...state.binders.filter((item) => item.id !== binder.id), { ...binder, name: binder.name.trim() }] }
}

export function validateLocation(state: CollectionState, location: Location) {
  if (location.kind === 'category') requireValid(state.categories.some((category) => category.id === location.categoryId), 'Destination category no longer exists.')
  if (location.kind === 'binder') {
    const binder = state.binders.find((item) => item.id === location.binderId)
    requireValid(binder, 'Destination binder no longer exists.')
    requireValid(Number.isInteger(location.page) && location.page >= 0 && location.page < binder.pageCount && Number.isInteger(location.pocket) && location.pocket >= 0 && location.pocket < binder.rows * binder.columns, 'Choose a valid page and pocket. Add pages or free a pocket if the binder is full.')
  }
}
export function pocketKey(location: Location): string | null {
  return location.kind === 'binder' ? JSON.stringify([location.binderId, location.page, location.pocket]) : null
}
export function moveCopies(state: CollectionState, moves: { copyId: string; location: Location }[]): CollectionState {
  requireValid(moves.length, 'Select at least one copy.')
  const assignments = new Map<string, Location>()
  for (const move of moves) {
    requireValid(state.copies.some((copy) => copy.id === move.copyId) && !assignments.has(move.copyId), 'A selected copy is missing or selected twice.')
    validateLocation(state, move.location)
    // Occupied destinations are never implicit swaps, even within a batch.
    const key = pocketKey(move.location)
    requireValid(!key || !state.copies.some((copy) => copy.id !== move.copyId && pocketKey(copy.location) === key), 'Pocket is occupied. Choose an empty pocket or free it first.')
    assignments.set(move.copyId, move.location)
  }
  const occupied = new Set<string>()
  const copies = state.copies.map((copy) => ({ ...copy, location: assignments.get(copy.id) ?? copy.location }))
  for (const copy of copies) {
    const key = pocketKey(copy.location)
    requireValid(!key || !occupied.has(key), 'Multiple copies cannot share a pocket.')
    if (key) occupied.add(key)
  }
  return { ...state, copies }
}

export function deleteContainer(state: CollectionState, kind: 'category' | 'binder', id: string): CollectionState {
  requireValid((kind === 'category' ? state.categories : state.binders).some((item) => item.id === id), 'Container no longer exists.')
  return {
    ...state,
    categories: kind === 'category' ? state.categories.filter((item) => item.id !== id) : state.categories,
    binders: kind === 'binder' ? state.binders.filter((item) => item.id !== id) : state.binders,
    copies: state.copies.map((copy) => {
      const location = copy.location
      return (location.kind === 'category' && kind === 'category' && location.categoryId === id) || (location.kind === 'binder' && kind === 'binder' && location.binderId === id)
        ? { ...copy, location: { kind: 'unsorted' } } : copy
    }),
  }
}

export interface CopyFilters extends CardFilters { elementalType: string; generation: string; minValue: string; maxValue: string }
export const emptyCopyFilters: CopyFilters = { ...emptyFilters, elementalType: '', generation: '', minValue: '', maxValue: '' }
export type Scope = { kind: 'all' | 'bulk' | 'unsorted' } | { kind: 'category'; id: string } | { kind: 'binder'; id: string }
export function filterCopies(state: CollectionState, filters: CopyFilters, scope: Scope = { kind: 'all' }): OwnedCopy[] {
  const min = parseEuro(filters.minValue), max = parseEuro(filters.maxValue)
  requireValid(min === null || max === null || min <= max, 'Minimum value cannot exceed maximum value.')
  const matchingEntries = new Set(filterCards(projectCards(state), filters).filter((entry) =>
    (!filters.elementalType || entry.elementalTypes?.includes(filters.elementalType)) &&
    (!filters.generation || entry.generations?.includes(filters.generation))).map((entry) => entry.id))
  return state.copies.filter((copy) => {
    const location = copy.location
    const inScope = scope.kind === 'all' || (scope.kind === 'bulk' && location.kind !== 'binder') ||
      (scope.kind === 'unsorted' && location.kind === 'unsorted') ||
      (scope.kind === 'category' && location.kind === 'category' && location.categoryId === scope.id) ||
      (scope.kind === 'binder' && location.kind === 'binder' && location.binderId === scope.id)
    return inScope && matchingEntries.has(copy.entryId) &&
      (min === null || (copy.valueCents !== null && copy.valueCents >= min)) &&
      (max === null || (copy.valueCents !== null && copy.valueCents <= max))
  })
}
