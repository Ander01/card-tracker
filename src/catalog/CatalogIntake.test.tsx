import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { CatalogIntake } from './CatalogIntake'
import { catalogClient, type CatalogClient, type SearchPage } from './client'
import { App } from '../App'
import { addCopies, emptyCollection, moveCopies, saveBinder, type CollectionState, type NewCard } from '../domain/collection'
import { storageKey } from '../domain/storage'

const set = { id: 'base1', name: 'Base Set', seriesId: 'base' }
const summary = { id: 'base1-4', name: 'Charizard', collectorNumber: '4', set }
const card: NewCard = {
  name: 'Charizard', set: 'Base Set', type: 'Pokemon', rarity: 'Illustration rare', quantity: 1, notes: '',
  elementalTypes: ['Fire'], generations: ['I'],
  catalog: {
    provider: 'tcgdex', language: 'en', cardId: 'base1-4', setId: 'base1', collectorNumber: '4',
    snapshot: { imageBaseUrl: 'https://assets.tcgdex.net/en/base/base1/4', variants: { flags: { holo: true, normal: false } } },
  },
}
function client(): CatalogClient {
  return {
    sets: vi.fn().mockResolvedValue([set]),
    search: vi.fn().mockResolvedValue({ cards: [summary], nextPage: null }),
    card: vi.fn().mockResolvedValue(card),
  }
}
function search(name = 'Charizard') {
  fireEvent.change(screen.getByLabelText('Catalog card name'), { target: { value: name } })
}
async function review() { fireEvent.click(await screen.findByRole('button', { name: 'Review Charizard, Base Set 4' })) }
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

describe('catalog intake', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks() })

  it('reviews read-only identity, exposes variants, and detaches catalog metadata on manual fallback', async () => {
    const api = client(), onManual = vi.fn(), onSave = vi.fn()
    const { container } = render(<CatalogIntake client={api} onManual={onManual} onSave={onSave} />)
    search()
    await review()
    const region = await screen.findByRole('region', { name: 'Review catalog card' })
    expect(within(region).getByRole('heading', { name: 'Review Charizard' })).toHaveFocus()
    expect(screen.queryByLabelText('Card name')).toBeNull()
    expect(region).toHaveTextContent('Illustration rare')
    fireEvent.click(screen.getByText('Available printings (not owned variants)'))
    expect(region).toHaveTextContent('holo: available')
    expect((await axe(container)).violations).toHaveLength(0)
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText('Notes (optional)'), { target: { value: 'My favorite' } })
    fireEvent.click(screen.getByRole('button', { name: 'Use manual entry' }))
    expect(onManual).toHaveBeenCalledWith(expect.objectContaining({ name: 'Charizard', quantity: 3, notes: 'My favorite' }))
    expect(onManual.mock.calls[0][0]).not.toHaveProperty('catalog')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('prevents submission before full details and handles cancellation', async () => {
    const api = client(), pending = deferred<NewCard>(), onSave = vi.fn()
    vi.mocked(api.card).mockReturnValue(pending.promise)
    render(<CatalogIntake client={api} onManual={vi.fn()} onSave={onSave} />)
    search()
    await review()
    expect(screen.getByText('Loading full card details...')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Save catalog card' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Back to search results' }))
    pending.resolve(card)
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Review catalog card' })).toBeNull())
    expect(onSave).not.toHaveBeenCalled()
  })

  it('cancels stale searches, paginates with provider cursors and supports set-only lookup', async () => {
    const api = client(), first = deferred<SearchPage>()
    vi.mocked(api.search).mockReturnValueOnce(first.promise).mockResolvedValue({ cards: [summary], nextPage: 4 })
    render(<CatalogIntake client={api} onManual={vi.fn()} onSave={vi.fn()} />)
    search('old')
    await waitFor(() => expect(api.search).toHaveBeenCalledWith('old', '', 1, expect.any(AbortSignal)))
    const oldSignal = vi.mocked(api.search).mock.calls[0][3]
    search('new')
    expect(oldSignal.aborted).toBe(true)
    await review()
    first.resolve({ cards: [{ ...summary, name: 'Stale' }], nextPage: null })
    await waitFor(() => expect(screen.queryByText('Stale')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Back to search results' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next results' }))
    await waitFor(() => expect(api.search).toHaveBeenCalledWith('new', '', 4, expect.any(AbortSignal)))
    fireEvent.click(await screen.findByRole('button', { name: 'Previous results' }))
    search('')
    fireEvent.change(screen.getByLabelText('Catalog set'), { target: { value: 'base1' } })
    await waitFor(() => expect(api.search).toHaveBeenCalledWith('', 'base1', 1, expect.any(AbortSignal)))
  })

  it('distinguishes no matches, search failure and detail failure, and retries', async () => {
    const api = client()
    vi.mocked(api.search).mockRejectedValueOnce(new Error('Network failed')).mockResolvedValue({ cards: [], nextPage: null })
    render(<CatalogIntake client={api} onManual={vi.fn()} onSave={vi.fn()} />)
    search()
    expect(await screen.findByRole('alert')).toHaveTextContent('Network failed')
    fireEvent.click(screen.getByRole('button', { name: 'Retry search' }))
    expect(await screen.findByText('No matching physical cards found.')).toBeTruthy()
    vi.mocked(api.search).mockResolvedValue({ cards: [summary], nextPage: null })
    vi.mocked(api.card).mockRejectedValueOnce(new Error('Detail failed')).mockResolvedValue({ ...card, rarity: undefined, catalog: { ...card.catalog!, snapshot: {} } })
    search('Char')
    await review()
    expect(await screen.findByRole('alert')).toHaveTextContent('Detail failed')
    expect(screen.queryByRole('button', { name: 'Save catalog card' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Retry card details' }))
    const region = await screen.findByRole('region', { name: 'Review catalog card' })
    expect(within(region).getAllByText('Unknown').length).toBeGreaterThan(0)
    expect(within(region).getByText('Artwork unavailable')).toBeTruthy()
  })

  it('offers index retry and manual entry using keyboard', async () => {
    const api = client(), manual = vi.fn(), user = userEvent.setup()
    vi.mocked(api.sets).mockRejectedValueOnce(new Error('Sets unavailable')).mockResolvedValue([set])
    render(<CatalogIntake client={api} onManual={manual} onSave={vi.fn()} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Sets unavailable')
    await user.click(screen.getByRole('button', { name: 'Retry catalog' }))
    await waitFor(() => expect(screen.getByLabelText('Catalog set')).toBeEnabled())
    screen.getByRole('button', { name: 'Use manual entry' }).focus()
    await user.keyboard('{Enter}')
    expect(manual).toHaveBeenCalled()
  })

  it('saves a reviewed card without artwork or variant data using keyboard selection', async () => {
    const api = client(), save = vi.fn().mockReturnValue(true), user = userEvent.setup()
    vi.mocked(api.card).mockResolvedValue({ ...card, rarity: undefined, catalog: { ...card.catalog!, snapshot: {} } })
    render(<CatalogIntake client={api} onManual={vi.fn()} onSave={save} />)
    search()
    const button = await screen.findByRole('button', { name: 'Review Charizard, Base Set 4' })
    button.focus()
    await user.keyboard('{Enter}')
    const region = await screen.findByRole('region', { name: 'Review catalog card' })
    expect(within(region).getByText('Artwork unavailable')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Save catalog card' }))
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ rarity: undefined, catalog: expect.objectContaining({ snapshot: {} }) }))
    expect(screen.getByLabelText('Catalog card name')).toHaveFocus()
  })

  it('adds three distinct copies, rejects invalid quantities/save failure and reloads without catalog access', async () => {
    vi.spyOn(catalogClient, 'sets').mockResolvedValue([set])
    vi.spyOn(catalogClient, 'search').mockResolvedValue({ cards: [summary], nextPage: null })
    const details = vi.spyOn(catalogClient, 'card').mockResolvedValue(card)
    const { unmount } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Open my collection/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Search card catalog' }))
    search()
    await review()
    await screen.findByRole('region', { name: 'Review catalog card' })
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save catalog card' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Quantity/)
    expect(localStorage.getItem(storageKey)).toBeNull()
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '3' } })
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    fireEvent.click(screen.getByRole('button', { name: 'Save catalog card' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Quota/)
    expect(localStorage.getItem(storageKey)).toBeNull()
    write.mockRestore()
    fireEvent.click(screen.getByRole('button', { name: 'Save catalog card' }))
    const state: CollectionState = JSON.parse(localStorage.getItem(storageKey)!)
    expect(state.copies).toHaveLength(3)
    expect(new Set(state.copies.map((copy) => copy.id)).size).toBe(3)
    expect(state.entries[0].id).not.toBe('base1-4')
    expect(state.entries[0].catalog?.cardId).toBe('base1-4')
    expect(state.copies.every((copy) => copy.valueCents === null && copy.location.kind === 'unsorted')).toBe(true)
    unmount()
    details.mockRejectedValue(new Error('Offline'))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Open my collection/ }))
    expect(screen.getAllByLabelText(/Select Charizard copy/)).toHaveLength(3)
    expect(details).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(storageKey)).toBe(JSON.stringify(state))
  })

  it('keeps artwork, binder occupancy, values and manual copies usable after image errors', async () => {
    let state = addCopies(emptyCollection(), { ...card, quantity: 2 })
    state = addCopies(state, { name: 'Manual', set: '', type: 'Trainer', notes: '', quantity: 1 })
    state = saveBinder(state, { id: 'b', name: 'Art binder', color: '#526057', rows: 1, columns: 2, pageCount: 2 })
    state = moveCopies(state, [{ copyId: state.copies[0].id, location: { kind: 'binder', binderId: 'b', page: 0, pocket: 1 } }])
    localStorage.setItem(storageKey, JSON.stringify(state))
    const before = localStorage.getItem(storageKey), user = userEvent.setup()
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Open my collection/ }))
    expect(screen.getAllByRole('img', { name: 'Charizard, Base Set 4' })).toHaveLength(2)
    const filter = screen.getAllByLabelText('Rarity', { exact: true })[0]
    expect(within(filter).getByRole('option', { name: 'Illustration rare' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^Art binder.*pockets/ }))
    expect(screen.getAllByText('Empty pocket')).toHaveLength(1)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByText('Artwork unavailable')).toBeTruthy()
    const select = screen.getByLabelText('Select Charizard copy 1')
    select.focus()
    await user.keyboard(' ')
    expect(select).toBeChecked()
    expect((await axe(container)).violations).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getAllByText('Empty pocket')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(screen.getByLabelText('Select Charizard copy 1')).toBeTruthy()
    expect(localStorage.getItem(storageKey)).toBe(before)
  })
})
