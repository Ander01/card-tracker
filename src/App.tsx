import { useMemo, useState } from 'react'
import {
  cardTypes,
  createLocalStorage,
  emptyFilters,
  filterCards,
  rarities,
  type Card,
  type CardFilters,
  type NewCard,
} from './domain/collection'
import { suggestBinderOrder, type BinderSuggestion } from './domain/suggestions'

type View = 'home' | 'collection' | 'suggestions'

const initialCard: NewCard = { name: '', set: '', type: 'Pokemon', rarity: 'Common', quantity: 1, notes: '' }
const storage = createLocalStorage()

export function App() {
  const [view, setView] = useState<View>('home')
  const [cards, setCards] = useState<Card[]>(() => storage.load())
  const [filters, setFilters] = useState<CardFilters>(emptyFilters)
  const [card, setCard] = useState<NewCard>(initialCard)
  const [formError, setFormError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [theme, setTheme] = useState('')
  const [suggestion, setSuggestion] = useState<BinderSuggestion | null>(null)

  const visibleCards = useMemo(() => filterCards(cards, filters), [cards, filters])
  const updateFilters = (change: Partial<CardFilters>) => setFilters((current) => ({ ...current, ...change }))

  function addCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!card.name.trim()) {
      setFormError('Card name is required.')
      return
    }
    if (!Number.isInteger(card.quantity) || card.quantity < 1) {
      setFormError('Quantity must be a whole number greater than zero.')
      return
    }
    const nextCard: Card = { ...card, name: card.name.trim(), id: crypto.randomUUID() }
    const nextCards = [...cards, nextCard]
    setCards(nextCards)
    storage.save(nextCards)
    setCard(initialCard)
    setFormError('')
    setSavedMessage(`${nextCard.name} was added to your collection.`)
  }

  function generateSuggestion() {
    if (!theme.trim()) {
      setSuggestion(null)
      return
    }
    setSuggestion(suggestBinderOrder(cards, theme))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('home')} aria-label="Card Tracker home">CARD<span>TRACKER</span></button>
        <nav aria-label="Primary navigation">
          <button className={view === 'collection' ? 'nav-link active' : 'nav-link'} onClick={() => setView('collection')}>Collection</button>
          <button className={view === 'suggestions' ? 'nav-link active' : 'nav-link'} onClick={() => setView('suggestions')}>Binder ideas</button>
        </nav>
      </header>

      {view === 'home' && (
        <main className="hero-page">
          <div className="hero-copy">
            <p className="eyebrow">YOUR COLLECTION, YOUR STORY</p>
            <h1>Build a binder<br /><em>worth showing off.</em></h1>
            <p className="hero-text">Keep your Pokemon cards organized and discover thoughtful binder layouts around the themes you love.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setView('collection')}>Open my collection <span aria-hidden="true">-&gt;</span></button>
              <button className="text-button" onClick={() => setView('suggestions')}>Explore binder ideas</button>
            </div>
          </div>
          <div className="hero-art" aria-label="Decorative card shapes">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="card-stack"><div className="mock-card back" /><div className="mock-card front"><span>PKMN</span><strong>01</strong><small>COLLECT<br />WITH INTENT</small></div></div>
          </div>
          <section className="feature-strip"><div><strong>01</strong><span>Track every favorite</span></div><div><strong>02</strong><span>Find what fits together</span></div><div><strong>03</strong><span>Arrange it your way</span></div></section>
        </main>
      )}

      {view === 'collection' && (
        <main className="page">
          <div className="page-heading"><div><p className="eyebrow">THE ARCHIVE</p><h1>My collection</h1><p>Every card has a place. Start building yours.</p></div><button className="primary-button" onClick={() => document.getElementById('add-card')?.focus()}>+ Add a card</button></div>
          {savedMessage && <div className="success-message" role="status">{savedMessage}</div>}
          <div className="collection-layout">
            <section className="panel collection-panel">
              <div className="panel-heading"><div><h2>Cards in your collection</h2><span className="count">{cards.length} {cards.length === 1 ? 'card' : 'cards'}</span></div><button className="small-button" onClick={() => setView('suggestions')}>Arrange cards -&gt;</button></div>
              <div className="filters"><label>Search<input value={filters.query} onChange={(event) => updateFilters({ query: event.target.value })} placeholder="Card name..." /></label><label>Set<input value={filters.set} onChange={(event) => updateFilters({ set: event.target.value })} placeholder="Any set..." /></label><label>Type<select value={filters.type} onChange={(event) => updateFilters({ type: event.target.value })}><option value="">All types</option>{cardTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>Rarity<select value={filters.rarity} onChange={(event) => updateFilters({ rarity: event.target.value })}><option value="">All rarities</option>{rarities.map((rarity) => <option key={rarity}>{rarity}</option>)}</select></label></div>
              {visibleCards.length === 0 ? <div className="empty-state"><span className="empty-icon">+</span><h3>{cards.length ? 'No cards match those filters' : 'Your collection is waiting'}</h3><p>{cards.length ? 'Try clearing a filter or searching for another card.' : 'Add your first card to begin shaping your archive.'}</p></div> : <div className="card-list">{visibleCards.map((item) => <article className="card-row" key={item.id}><div className="card-symbol">{item.name.slice(0, 1).toUpperCase()}</div><div className="card-details"><h3>{item.name}</h3><p>{item.set || 'Set not specified'} <span>·</span> {item.type} <span>·</span> {item.rarity}</p></div><span className="quantity">x{item.quantity}</span></article>)}</div>}
            </section>
            <section className="panel add-panel"><p className="eyebrow">NEW ENTRY</p><h2>Add a card</h2><form onSubmit={addCard}><label htmlFor="add-card">Card name<input id="add-card" value={card.name} onChange={(event) => setCard({ ...card, name: event.target.value })} placeholder="e.g. Umbreon" /></label><label>Set<input value={card.set} onChange={(event) => setCard({ ...card, set: event.target.value })} placeholder="e.g. Neo Discovery" /></label><div className="form-grid"><label>Type<select value={card.type} onChange={(event) => setCard({ ...card, type: event.target.value as NewCard['type'] })}>{cardTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>Rarity<select value={card.rarity} onChange={(event) => setCard({ ...card, rarity: event.target.value as NewCard['rarity'] })}>{rarities.map((rarity) => <option key={rarity}>{rarity}</option>)}</select></label></div><label>Quantity<input type="number" min="1" value={card.quantity} onChange={(event) => setCard({ ...card, quantity: Number(event.target.value) })} /></label><label>Notes <span className="optional">Optional</span><textarea value={card.notes} onChange={(event) => setCard({ ...card, notes: event.target.value })} placeholder="Why this card matters..." rows={3} /></label>{formError && <p className="form-error" role="alert">{formError}</p>}<button className="primary-button full-width" type="submit">Save card <span aria-hidden="true">-&gt;</span></button></form></section>
          </div>
        </main>
      )}

      {view === 'suggestions' && (
        <main className="page suggestion-page"><div className="page-heading"><div><p className="eyebrow">THE CURATION DESK</p><h1>Binder ideas</h1><p>Give your collection a direction and we will find the through-line.</p></div><span className="collection-count">{cards.length} cards available</span></div><section className="suggestion-builder panel"><label htmlFor="theme">What story are you telling?</label><div className="suggestion-input"><input id="theme" value={theme} onChange={(event) => setTheme(event.target.value)} placeholder="Try fire, water, evolution, or favorites" onKeyDown={(event) => event.key === 'Enter' && generateSuggestion()} /><button className="primary-button" onClick={generateSuggestion}>Generate layout -&gt;</button></div><div className="theme-chips">{['Fire', 'Water', 'Evolution', 'Favorites'].map((item) => <button key={item} onClick={() => setTheme(item)}>{item}</button>)}</div>{!theme.trim() && <p className="helper-text">Choose a theme to see how your cards could come together.</p>}{theme.trim() && !suggestion && <p className="form-error" role="alert">Enter a theme before generating a layout.</p>}</section>{suggestion && <section className="suggestion-result"><div className="result-heading"><div><p className="eyebrow">YOUR LAYOUT</p><h2>{suggestion.theme}</h2><p>{suggestion.rationale}</p></div><span className="result-count">{suggestion.cards.length} placed</span></div>{suggestion.cards.length ? <div className="binder-grid">{suggestion.cards.map((item, index) => <article className="binder-slot" key={item.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.name}</strong><small>{item.set || 'Set not specified'}</small></article>)}</div> : <div className="empty-state result-empty"><h3>No cards found for this theme</h3><p>Add cards with notes or names related to this theme, then try again.</p></div>}{suggestion.unclassified.length > 0 && <p className="unclassified"><strong>{suggestion.unclassified.length} card(s)</strong> could not be classified because theme-related information is unavailable.</p>}</section>}</main>
      )}
    </div>
  )
}
