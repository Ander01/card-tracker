import {
  addCopies, cardTypes, emptyCollection, generations, elementalTypes, rarities, requireValid,
  validateBinder, validateLocation, pocketKey, CollectionError,
  type CardEntry, type CollectionState, type Location,
} from './collection'

export const storageKey = 'card-tracker.collection'
export const legacyBackupKey = 'card-tracker.collection.legacy-backup'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function object(value: unknown): Record<string, unknown> {
  requireValid(isObject(value), 'Invalid stored record.')
  return value
}
function string(value: unknown): string {
  requireValid(typeof value === 'string', 'Invalid stored text.')
  return value
}
function id(value: unknown): string {
  const text = string(value)
  requireValid(text.trim(), 'Invalid stored identifier.')
  return text
}
function number(value: unknown): number {
  requireValid(typeof value === 'number' && Number.isSafeInteger(value), 'Invalid stored whole number.')
  return value
}
function array(value: unknown): unknown[] {
  requireValid(Array.isArray(value), 'Invalid stored list.')
  return value
}
function choices<T extends string>(value: unknown, supported: readonly T[]): T {
  const found = supported.find((choice) => choice === value)
  requireValid(found !== undefined, 'Unsupported stored metadata.')
  return found
}
function entry(value: unknown): CardEntry {
  const data = object(value)
  requireValid(!('image' in data) && !('dataUrl' in data), 'Unexpected image data in collection.')
  return {
    id: id(data.id), name: id(data.name), set: string(data.set), type: choices(data.type, cardTypes),
    rarity: choices(data.rarity, rarities), notes: string(data.notes),
    elementalTypes: data.elementalTypes === undefined ? [] : array(data.elementalTypes).map((value) => choices(value, elementalTypes)),
    generations: data.generations === undefined ? [] : array(data.generations).map((value) => choices(value, generations)),
  }
}
function location(value: unknown): Location {
  const data = object(value)
  if (data.kind === 'unsorted') {
    requireValid(Object.keys(data).length === 1, 'Invalid Unsorted location.')
    return { kind: 'unsorted' }
  }
  if (data.kind === 'category') {
    requireValid(Object.keys(data).length === 2, 'Invalid category location.')
    return { kind: 'category', categoryId: id(data.categoryId) }
  }
  requireValid(data.kind === 'binder' && Object.keys(data).length === 4, 'Invalid stored location.')
  return { kind: 'binder', binderId: id(data.binderId), page: number(data.page), pocket: number(data.pocket) }
}
function unique(values: string[]) {
  requireValid(new Set(values).size === values.length, 'Duplicate stored identifiers or category names.')
}
export function parseState(value: unknown): CollectionState {
  const data = object(value)
  requireValid(data.version === 2 && data.currency === 'EUR', 'Unsupported collection version or currency.')
  const state: CollectionState = {
    version: 2, currency: 'EUR',
    entries: array(data.entries).map(entry),
    categories: array(data.categories).map((value) => {
      const item = object(value)
      const name = id(item.name).trim()
      requireValid(name.toLowerCase() !== 'unsorted', 'Unsorted cannot be a saved category.')
      return { id: id(item.id), name }
    }),
    binders: array(data.binders).map((value) => {
      const item = object(value)
      const binder = { id: id(item.id), name: id(item.name), color: string(item.color), pageCount: number(item.pageCount), rows: number(item.rows), columns: number(item.columns) }
      validateBinder(binder)
      return binder
    }),
    copies: array(data.copies).map((value) => {
      const item = object(value)
      const cents = item.valueCents === null ? null : number(item.valueCents)
      requireValid(cents === null || cents >= 0, 'Invalid stored EUR value.')
      return { id: id(item.id), entryId: id(item.entryId), valueCents: cents, location: location(item.location) }
    }),
  }
  for (const records of [state.entries, state.copies, state.categories, state.binders]) unique(records.map((record) => record.id))
  unique(state.categories.map((category) => category.name.toLowerCase()))
  const entries = new Set(state.entries.map((entry) => entry.id))
  const occupied = new Set<string>()
  for (const copy of state.copies) {
    requireValid(entries.has(copy.entryId), 'Copy refers to a missing card entry.')
    validateLocation(state, copy.location)
    const key = pocketKey(copy.location)
    requireValid(!key || !occupied.has(key), 'Conflicting stored binder pockets.')
    if (key) occupied.add(key)
  }
  return state
}

export class StorageError extends Error {}
export function createLocalStorage(provided?: Storage) {
  const access = () => provided ?? window.localStorage
  return {
    load(): CollectionState {
      try {
        const storage = access()
        const raw = storage.getItem(storageKey)
        if (raw === null) return emptyCollection()
        const parsed: unknown = JSON.parse(raw)
        if (!Array.isArray(parsed)) return parseState(parsed)
        let migrated = emptyCollection()
        for (const value of parsed) {
          const item = object(value)
          const metadata = entry(item)
          migrated = addCopies(migrated, { ...metadata, quantity: number(item.quantity) }, metadata.id)
        }
        parseState(migrated)
        const backup = storage.getItem(legacyBackupKey)
        requireValid(backup === null || backup === raw, 'An existing legacy backup differs from this collection. Preserve both payloads before retrying migration.')
        if (backup === null) storage.setItem(legacyBackupKey, raw)
        storage.setItem(storageKey, JSON.stringify(migrated))
        return migrated
      } catch (error) {
        throw new StorageError(`Could not load collection. Stored data has not been reset. ${error instanceof Error ? error.message : 'Storage access failed.'}`)
      }
    },
    save(state: CollectionState): void {
      try {
        parseState(state)
        access().setItem(storageKey, JSON.stringify(state))
      } catch (error) {
        if (error instanceof CollectionError) throw error
        throw new StorageError(`Could not save collection. Previous saved data is unchanged. ${error instanceof Error ? error.message : 'Storage access failed.'}`)
      }
    },
  }
}
