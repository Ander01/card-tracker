import { useEffect, useRef, useState } from 'react'
import { CardArtwork } from '../CardArtwork'
import type { NewCard } from '../domain/collection'
import { catalogClient, type CatalogClient, type CatalogSet, type CardSummary, type SearchPage } from './client'

type Results = { kind: 'idle' | 'loading' } | { kind: 'error'; message: string } | { kind: 'ready'; page: SearchPage }
type Review = { kind: 'loading'; id: string } | { kind: 'error'; id: string; message: string } | { kind: 'ready'; id: string; card: NewCard }
const errorMessage = (error: unknown) => `Card catalog unavailable: ${error instanceof Error ? error.message : 'TCGdex could not be reached.'} Retry or use manual entry.`

export function CatalogIntake({ onSave, onManual, client = catalogClient }: {
  onSave: (card: NewCard) => boolean
  onManual: (card?: NewCard) => void
  client?: CatalogClient
}) {
  const [sets, setSets] = useState<CatalogSet[]>()
  const [indexError, setIndexError] = useState('')
  const [retry, setRetry] = useState(0)
  const [query, setQuery] = useState('')
  const [setId, setSetId] = useState('')
  const [paging, setPaging] = useState({ cursor: 1, history: [] as number[] })
  const [results, setResults] = useState<Results>({ kind: 'idle' })
  const [review, setReview] = useState<Review | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const detailRequest = useRef<AbortController | null>(null)
  const reviewHeading = useRef<HTMLHeadingElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    setIndexError('')
    client.sets(controller.signal).then((sets) => {
      if (!controller.signal.aborted) setSets(sets)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setIndexError(errorMessage(error))
    })
    return () => controller.abort()
  }, [client, retry])

  useEffect(() => {
    const controller = new AbortController()
    if (!sets || (!query.trim() && !setId)) {
      setResults({ kind: 'idle' })
      return () => controller.abort()
    }
    setResults({ kind: 'loading' })
    const timer = setTimeout(() => {
      client.search(query, setId, paging.cursor, controller.signal).then((page) => {
        if (!controller.signal.aborted) setResults({ kind: 'ready', page })
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) setResults({ kind: 'error', message: errorMessage(error) })
      })
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }
  }, [client, sets, query, setId, paging.cursor, retry])

  useEffect(() => () => detailRequest.current?.abort(), [])
  useEffect(() => { if (review?.kind === 'ready') reviewHeading.current?.focus() }, [review])

  function clearReview() {
    detailRequest.current?.abort()
    setReview(null)
    setQuantity(1)
    setNotes('')
  }
  function updateSearch(value: string, field: 'name' | 'set') {
    clearReview()
    if (field === 'name') setQuery(value)
    else setSetId(value)
    setPaging({ cursor: 1, history: [] })
  }
  function selectCard(id: string) {
    clearReview()
    const controller = new AbortController()
    detailRequest.current = controller
    setReview({ kind: 'loading', id })
    client.card(id, controller.signal).then((card) => {
      if (!controller.signal.aborted) setReview({ kind: 'ready', id, card })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setReview({ kind: 'error', id, message: errorMessage(error) })
    })
  }
  function manual() {
    detailRequest.current?.abort()
    if (review?.kind === 'ready') {
      const { catalog: _catalog, ...card } = review.card
      onManual({ ...card, quantity, notes })
    } else onManual()
  }
  function resultCard(card: CardSummary) {
    return <li key={card.id}>
      <CardArtwork baseUrl={card.imageBaseUrl} name={`${card.name}, ${card.set.name} ${card.collectorNumber}`} />
      <div><h3>{card.name}</h3><p>{card.set.name} / {card.collectorNumber}</p>
        <button className="secondary-button" type="button" onClick={() => selectCard(card.id)} aria-label={`Review ${card.name}, ${card.set.name} ${card.collectorNumber}`}>Review card</button>
      </div>
    </li>
  }
  const selected = review?.kind === 'ready' ? review.card : undefined
  const snapshot = selected?.catalog?.snapshot
  return <div className="catalog-intake">
    <p className="helper-text">Find an English physical card. Check its set and number before adding copies.</p>
    <div className="catalog-search">
      <label>Catalog card name<input ref={searchInput} value={query} onChange={(event) => updateSearch(event.target.value, 'name')} placeholder="e.g. Pikachu" /></label>
      <label>Catalog set<select value={setId} disabled={!sets} onChange={(event) => updateSearch(event.target.value, 'set')}><option value="">All physical sets</option>{sets?.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}</select></label>
    </div>
    {!sets && !indexError && <p role="status">Loading physical card sets...</p>}
    {indexError && <div role="alert"><p>{indexError}</p><button className="secondary-button" onClick={() => setRetry((value) => value + 1)}>Retry catalog</button></div>}
    {results.kind === 'idle' && sets && <p>Enter a card name or choose a set to start searching.</p>}
    {results.kind === 'loading' && <p role="status">Searching card catalog...</p>}
    {results.kind === 'error' && <div role="alert"><p>{results.message}</p><button className="secondary-button" onClick={() => setRetry((value) => value + 1)}>Retry search</button></div>}
    {!review && results.kind === 'ready' && <>
      <p role="status">{results.page.cards.length ? `${results.page.cards.length} cards on this page` : 'No matching physical cards found.'}</p>
      <ul className="catalog-results">{results.page.cards.map(resultCard)}</ul>
      <div className="page-controls">
        <button type="button" className="secondary-button" disabled={!paging.history.length} onClick={() => setPaging({ cursor: paging.history.at(-1) ?? 1, history: paging.history.slice(0, -1) })}>Previous results</button>
        <span>Results page {paging.history.length + 1}</span>
        <button type="button" className="secondary-button" disabled={results.page.nextPage === null} onClick={() => {
          if (results.page.nextPage !== null) setPaging({ cursor: results.page.nextPage, history: [...paging.history, paging.cursor] })
        }}>Next results</button>
      </div>
    </>}
    {review?.kind === 'loading' && <p role="status">Loading full card details...</p>}
    {review?.kind === 'error' && <div role="alert"><p>{review.message}</p><button className="secondary-button" onClick={() => selectCard(review.id)}>Retry card details</button></div>}
    {selected && <section className="catalog-review" aria-label="Review catalog card">
      <h3 ref={reviewHeading} tabIndex={-1}>Review {selected.name}</h3>
      <div className="catalog-review-details">
        <CardArtwork baseUrl={snapshot?.imageBaseUrl} name={`${selected.name}, ${selected.set} ${selected.catalog?.collectorNumber}`} large />
        <dl>
          <dt>Set and number</dt><dd>{selected.set} / {selected.catalog?.collectorNumber}</dd>
          <dt>Catalog ID</dt><dd>{selected.catalog?.cardId} (English)</dd>
          <dt>Card kind</dt><dd>{selected.type}</dd>
          <dt>Rarity</dt><dd>{selected.rarity ?? 'Unknown'}</dd>
          <dt>Elemental typing</dt><dd>{selected.elementalTypes?.join(', ') || 'Unknown'}</dd>
          <dt>Pokemon generation</dt><dd>{selected.generations?.join(', ') || 'Unknown'}</dd>
          <dt>Illustrator</dt><dd>{snapshot?.illustrator ?? 'Unknown'}</dd>
          <dt>Pokedex numbers</dt><dd>{snapshot?.dexIds?.join(', ') || 'Unknown'}</dd>
        </dl>
      </div>
      <details><summary>Available printings (not owned variants)</summary>
        {!snapshot?.variants && <p>Printing variants unknown.</p>}
        {snapshot?.variants?.flags && <ul>{Object.entries(snapshot.variants.flags).map(([name, available]) => <li key={name}>{name}: {available ? 'available' : 'not available'}</li>)}</ul>}
        {snapshot?.variants?.detailed && <ul>{snapshot.variants.detailed.map((variant, index) => <li key={index}>{[variant.type, variant.subtype, variant.size, ...(variant.stamps ?? [])].filter(Boolean).join(' / ')}</li>)}</ul>}
        <p>Available printings describe the catalog, not the finish of a copy you own.</p>
      </details>
      <form noValidate onSubmit={(event) => {
        event.preventDefault()
        if (onSave({ ...selected, quantity, notes })) {
          clearReview()
          searchInput.current?.focus()
        }
      }}>
        <label>Quantity<input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value === '' ? 0 : Number(event.target.value))} /></label>
        <label>Notes (optional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} /></label>
        <button className="primary-button">Save catalog card</button>
      </form>
    </section>}
    {review && <button className="text-button" type="button" onClick={() => { clearReview(); searchInput.current?.focus() }}>Back to search results</button>}
    <div className="catalog-footer"><button className="text-button" type="button" onClick={manual}>Use manual entry</button><a href="https://www.tcgdex.net" target="_blank" rel="noreferrer">Card data and artwork via TCGdex</a></div>
  </div>
}
