import { describe, expect, it, vi } from 'vitest'
import { addCopies, emptyCollection, emptyCopyFilters, filterCopies, hasUnsorted, moveCopies, saveBinder, saveCategory, setCopyValue } from './collection'
import { createLocalStorage, legacyBackupKey, storageKey } from './storage'

const card = { id: '1', name: 'Pikachu', set: 'Base', type: 'Pokemon' as const, rarity: 'Common' as const, quantity: 4, notes: 'favorite' }

describe('versioned local collection storage', () => {
  it('migrates quantities exactly once, preserving raw backup, metadata and identity', () => {
    const storage = new StorageMock()
    const raw = JSON.stringify([card])
    storage.setItem(storageKey, raw)
    const state = createLocalStorage(storage).load()
    expect(state.entries[0]).toMatchObject({ id: '1', name: 'Pikachu', notes: 'favorite' })
    expect(state.copies).toHaveLength(4)
    expect(state.copies.every((copy) => copy.location.kind === 'unsorted' && copy.valueCents === null)).toBe(true)
    expect(storage.getItem(legacyBackupKey)).toBe(raw)
    expect(createLocalStorage(storage).load()).toEqual(state)
    expect(new Set(state.copies.map((copy) => copy.id)).size).toBe(4)
  })

  it('supports empty legacy and absent collections', () => {
    const storage = new StorageMock()
    expect(createLocalStorage(storage).load()).toEqual(emptyCollection())
    storage.setItem(storageKey, '[]')
    expect(createLocalStorage(storage).load()).toEqual(emptyCollection())
    expect(storage.getItem(legacyBackupKey)).toBe('[]')
  })

  it('does not overwrite a different existing legacy backup', () => {
    const storage = new StorageMock()
    const raw = JSON.stringify([card])
    storage.setItem(storageKey, raw)
    storage.setItem(legacyBackupKey, '[]')
    expect(() => createLocalStorage(storage).load()).toThrow(/backup differs/)
    expect(storage.getItem(storageKey)).toBe(raw)
    expect(storage.getItem(legacyBackupKey)).toBe('[]')
  })

  it('round trips migration, organization and per-copy values, then reintroduces Unsorted', () => {
    const storage = new StorageMock()
    storage.setItem(storageKey, JSON.stringify([card]))
    let state = createLocalStorage(storage).load()
    const ids = state.copies.map((copy) => copy.id)
    state = saveCategory(state, 'Trades', 'trades')
    state = saveBinder(state, { id: 'b', name: 'Stars', color: '#112233', rows: 3, columns: 3, pageCount: 20 })
    state = setCopyValue(setCopyValue(state, ids[0], '2'), ids[1], '20')
    state = moveCopies(state, state.copies.map((copy, index) => ({
      copyId: copy.id,
      location: index === 1 ? { kind: 'binder', binderId: 'b', page: 2, pocket: 4 } : { kind: 'category', categoryId: 'trades' },
    })))
    expect(hasUnsorted(state)).toBe(false)
    createLocalStorage(storage).save(state)
    expect(createLocalStorage(storage).load()).toEqual(state)
    state = addCopies(createLocalStorage(storage).load(), { ...card, quantity: 1 })
    expect(state.copies.slice(0, 4).map((copy) => copy.id)).toEqual(ids)
    expect(state.copies.slice(0, 2).map((copy) => copy.valueCents)).toEqual([200, 2000])
    expect(state.copies[1].location).toEqual({ kind: 'binder', binderId: 'b', page: 2, pocket: 4 })
    expect(state.copies.filter((copy) => copy.location.kind === 'unsorted')).toHaveLength(1)
  })

  it('preserves source on corrupted, unsupported or inconsistent data', () => {
    const valid = addCopies(emptyCollection(), card)
    const cases: unknown[] = [
      '{broken', { ...valid, version: 3 },
      { ...valid, entries: [...valid.entries, valid.entries[0]] },
      { ...valid, copies: [{ ...valid.copies[0], entryId: 'missing' }] },
      { ...valid, copies: [{ ...valid.copies[0], valueCents: -1 }] },
      { ...valid, copies: [{ ...valid.copies[0], location: { kind: 'category', categoryId: 'missing' } }] },
      { ...valid, binders: [{ id: 'b', name: 'x', color: '#112233', rows: 0, columns: 1, pageCount: 1 }] },
      { ...valid, binders: [{ id: 'b', name: 'x', color: '#112233', rows: 1, columns: 1, pageCount: 1 }], copies: valid.copies.map((copy) => ({ ...copy, location: { kind: 'binder', binderId: 'b', page: 0, pocket: 0 } })) },
    ]
    for (const value of cases) {
      const storage = new StorageMock()
      const raw = typeof value === 'string' ? value : JSON.stringify(value)
      storage.setItem(storageKey, raw)
      expect(() => createLocalStorage(storage).load()).toThrow(/Could not load/)
      expect(storage.getItem(storageKey)).toBe(raw)
    }
  })

  it('reports read, backup, snapshot and quota failures without clearing data', () => {
    const storage = new StorageMock()
    const raw = JSON.stringify([card])
    storage.setItem(storageKey, raw)
    const set = storage.setItem.bind(storage)
    const spy = vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    expect(() => createLocalStorage(storage).load()).toThrow(/Quota/)
    expect(storage.getItem(storageKey)).toBe(raw)
    spy.mockImplementation((key, value) => { if (key === storageKey) throw new Error('Snapshot failed'); set(key, value) })
    expect(() => createLocalStorage(storage).load()).toThrow(/Snapshot/)
    expect(storage.getItem(storageKey)).toBe(raw)
    expect(storage.getItem(legacyBackupKey)).toBe(raw)
    expect(() => createLocalStorage(storage).save(emptyCollection())).toThrow(/Could not save/)
    vi.spyOn(storage, 'getItem').mockImplementation(() => { throw new Error('Blocked') })
    expect(() => createLocalStorage(storage).load()).toThrow(/Blocked/)
  })

  it('handles a thousand copies with exact counts and stable ids across reload', () => {
    const storage = new StorageMock()
    let state = addCopies(emptyCollection(), { ...card, quantity: 1000 })
    state = saveBinder(state, { id: 'b', name: 'Big', color: '#112233', rows: 3, columns: 3, pageCount: 20 })
    state = moveCopies(state, [{ copyId: state.copies[0].id, location: { kind: 'binder', binderId: 'b', page: 19, pocket: 8 } }])
    createLocalStorage(storage).save(state)
    expect(createLocalStorage(storage).load()).toEqual(state)
    expect(filterCopies(state, emptyCopyFilters, { kind: 'bulk' })).toHaveLength(999)
    expect(state.copies).toHaveLength(1000)
  })
})

class StorageMock implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}
