import { describe, expect, it } from 'vitest'
import { createLocalStorage, type Card } from './collection'

describe('local collection storage', () => {
  it('restores cards from the same storage after reinitialization', () => {
    const storage = new StorageMock()
    const card: Card = { id: '1', name: 'Pikachu', set: 'Base', type: 'Pokemon', rarity: 'Common', quantity: 2, notes: '' }
    createLocalStorage(storage).save([card])
    expect(createLocalStorage(storage).load()).toEqual([card])
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
