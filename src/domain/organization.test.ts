import { describe, expect, it } from 'vitest'
import {
  addCopies, binderCapacity, deleteContainer, emptyCollection, emptyCopyFilters, filterCopies,
  euroInput, formatEuro, hasUnsorted, moveCopies, parseEuro, projectCards, saveBinder, saveCategory, setCopyValue,
  type Binder, type CollectionState, type NewCard,
} from './collection'

export const draft: NewCard = { name: 'Charizard', set: 'Base', type: 'Pokemon', rarity: 'Rare', notes: 'fire', quantity: 4, elementalTypes: ['Fire', 'Dragon'], generations: ['I'] }
export const binder: Binder = { id: 'binder', name: 'Favorites', color: '#526057', pageCount: 20, rows: 3, columns: 3 }
const initial = () => saveCategory(saveBinder(addCopies(emptyCollection(), draft), binder), 'Trades', 'trades')
const pocket = (page = 0, index = 0) => ({ kind: 'binder' as const, binderId: binder.id, page, pocket: index })

describe('physical collection organization', () => {
  it('creates stable individual copies and shared metadata, not duplicate entries', () => {
    const state = initial()
    expect(state.entries).toHaveLength(1)
    expect(state.entries[0].elementalTypes).toEqual(['Fire', 'Dragon'])
    expect(state.copies).toHaveLength(4)
    expect(new Set(state.copies.map((copy) => copy.id)).size).toBe(4)
    expect(projectCards(state)[0].quantity).toBe(4)
    expect(state.copies.every((copy) => copy.valueCents === null)).toBe(true)
    expect(() => addCopies(state, { ...draft, name: '' })).toThrow(/name/i)
    for (const quantity of [0, -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER]) expect(() => addCopies(state, { ...draft, quantity })).toThrow()
    expect(() => addCopies(state, { ...draft, elementalTypes: ['fake'] })).toThrow()
    const unknown = addCopies(emptyCollection(), { ...draft, elementalTypes: undefined, generations: undefined })
    expect(unknown.entries[0].generations).toEqual([])
  })

  it('tracks independent values exactly and rejects invalid money', () => {
    let state = initial()
    state = setCopyValue(state, state.copies[0].id, '2')
    state = setCopyValue(state, state.copies[1].id, '20,00')
    expect(state.copies.map((copy) => copy.valueCents)).toEqual([200, 2000, null, null])
    expect(parseEuro('0')).toBe(0)
    expect(formatEuro(null)).toBe('Unknown')
    expect(formatEuro(0)).not.toBe('Unknown')
    expect(parseEuro('0.29')).toBe(29)
    expect(parseEuro('90071992547409.91')).toBe(Number.MAX_SAFE_INTEGER)
    expect(euroInput(Number.MAX_SAFE_INTEGER)).toBe('90071992547409.91')
    expect(formatEuro(Number.MAX_SAFE_INTEGER)).toContain('91')
    expect(() => parseEuro('90071992547409.92')).toThrow()
    expect(setCopyValue(state, state.copies[0].id, '').copies[0].valueCents).toBeNull()
    for (const value of ['-1', 'NaN', 'Infinity', '1.001', '1e3', '9007199254740991']) expect(() => parseEuro(value)).toThrow()
    expect(() => setCopyValue(state, 'missing', '1')).toThrow()
  })

  it('manages divider names and derives temporary Unsorted independently of filtering', () => {
    let state = initial()
    expect(hasUnsorted(state)).toBe(true)
    expect(filterCopies(state, { ...emptyCopyFilters, query: 'nothing' })).toEqual([])
    expect(hasUnsorted(state)).toBe(true)
    for (const name of ['', ' UNSORTED ', ' trades ']) expect(() => saveCategory(state, name)).toThrow()
    state = saveCategory(state, 'Exchange', 'trades')
    expect(state.categories[0].name).toBe('Exchange')
    state = moveCopies(state, state.copies.map((copy) => ({ copyId: copy.id, location: { kind: 'category', categoryId: 'trades' } })))
    expect(hasUnsorted(state)).toBe(false)
    expect(state.copies).toHaveLength(4)
    state = deleteContainer(state, 'category', 'trades')
    expect(hasUnsorted(state)).toBe(true)
    expect(state.categories).toEqual([])
  })

  it('preserves ownership, values and gaps when splitting and moving copies', () => {
    let state = initial()
    const ids = state.copies.map((copy) => copy.id)
    state = setCopyValue(state, ids[0], '20')
    state = moveCopies(state, [{ copyId: ids[0], location: pocket(1, 4) }, { copyId: ids[1], location: { kind: 'category', categoryId: 'trades' } }])
    expect(projectCards(state)[0].quantity).toBe(4)
    expect(state.copies[0].valueCents).toBe(2000)
    expect(state.copies[2].location.kind).toBe('unsorted')
    state = moveCopies(state, [{ copyId: ids[0], location: { kind: 'unsorted' } }])
    expect(state.copies.map((copy) => copy.id)).toEqual(ids)
    expect(state.copies[1].location).toEqual({ kind: 'category', categoryId: 'trades' })
    state = moveCopies(state, [{ copyId: ids[0], location: pocket(1, 4) }])
    state = deleteContainer(state, 'binder', binder.id)
    expect(state.copies[0].valueCents).toBe(2000)
    expect(state.copies[0].location.kind).toBe('unsorted')
    expect(state.copies).toHaveLength(4)
  })

  it('rejects invalid batches and occupied pockets without mutating sources', () => {
    const original = initial()
    const first = original.copies[0].id, second = original.copies[1].id
    const state = moveCopies(original, [{ copyId: first, location: pocket() }])
    const before = JSON.stringify(state)
    const invalid = [
      [{ copyId: second, location: pocket() }],
      [{ copyId: second, location: pocket(20) }],
      [{ copyId: second, location: pocket(0, -1) }],
      [{ copyId: second, location: { kind: 'category' as const, categoryId: 'missing' } }],
      [{ copyId: 'missing', location: pocket(1) }],
      [{ copyId: second, location: pocket(1) }, { copyId: state.copies[2].id, location: pocket(1) }],
      [{ copyId: second, location: pocket(1) }, { copyId: second, location: pocket(2) }],
    ]
    for (const moves of invalid) {
      expect(() => moveCopies(state, moves)).toThrow()
      expect(JSON.stringify(state)).toBe(before)
    }
    const tiny = saveBinder(original, { ...binder, pageCount: 1, rows: 1, columns: 1 })
    const full = moveCopies(tiny, [{ copyId: first, location: pocket() }])
    expect(() => moveCopies(full, [{ copyId: second, location: pocket() }])).toThrow(/occupied|free/i)
    expect(full.binders[0].pageCount).toBe(1)
  })

  it('configures binders safely without reflow', () => {
    let state = initial()
    expect(binderCapacity(state.binders[0])).toBe(180)
    for (const change of [{ name: '' }, { color: 'red' }, { rows: 0 }, { columns: 1.5 }, { pageCount: Infinity }, { pageCount: Number.MAX_SAFE_INTEGER }]) expect(() => saveBinder(state, { ...binder, ...change })).toThrow()
    state = moveCopies(state, [{ copyId: state.copies[0].id, location: pocket(19) }])
    expect(() => saveBinder(state, { ...binder, pageCount: 19 })).toThrow(/removed pages/)
    expect(() => saveBinder(state, { ...binder, columns: 4 })).toThrow(/grid/)
    state = saveBinder(state, { ...binder, name: 'Renamed', color: '#112233', pageCount: 21 })
    expect(state.copies[0].location).toEqual(pocket(19))
    state = saveBinder(state, { ...state.binders[0], pageCount: 20 })
    expect(state.binders[0].pageCount).toBe(20)
  })

  it('filters at copy level with inclusive bounds, AND semantics and explicit scopes', () => {
    let state = initial()
    state = setCopyValue(setCopyValue(state, state.copies[0].id, '2'), state.copies[1].id, '20')
    state = moveCopies(state, [{ copyId: state.copies[1].id, location: pocket() }, { copyId: state.copies[0].id, location: { kind: 'category', categoryId: 'trades' } }])
    const before = JSON.stringify(state)
    expect(filterCopies(state, { ...emptyCopyFilters, minValue: '10' }).map((copy) => copy.id)).toEqual([state.copies[1].id])
    expect(filterCopies(state, { ...emptyCopyFilters, minValue: '2', maxValue: '2' })).toHaveLength(1)
    expect(filterCopies(state, { ...emptyCopyFilters, query: 'CHAR', set: 'Base', type: 'Pokemon', rarity: 'Rare', elementalType: 'Dragon', generation: 'I' })).toHaveLength(4)
    expect(filterCopies(state, { ...emptyCopyFilters, type: 'Energy' })).toEqual([])
    expect(filterCopies(state, { ...emptyCopyFilters, generation: 'II' })).toEqual([])
    expect(filterCopies(state, emptyCopyFilters, { kind: 'bulk' })).toHaveLength(3)
    expect(filterCopies(state, emptyCopyFilters, { kind: 'category', id: 'trades' })).toHaveLength(1)
    expect(filterCopies(state, emptyCopyFilters, { kind: 'unsorted' })).toHaveLength(2)
    expect(() => filterCopies(state, { ...emptyCopyFilters, minValue: '20', maxValue: '2' })).toThrow()
    expect(() => filterCopies(state, { ...emptyCopyFilters, minValue: '-1' })).toThrow()
    expect(JSON.stringify(state)).toBe(before)
    const unknown: CollectionState = { ...state, entries: state.entries.map((entry) => ({ ...entry, generations: [] })) }
    expect(filterCopies(unknown, { ...emptyCopyFilters, generation: 'I' })).toEqual([])
  })
})
