import { useEffect, useMemo, useState } from 'react'
import { addCopies, CollectionError, createLocalStorage, projectCards, type CollectionState, type NewCard } from './domain/collection'
import { StorageError } from './domain/storage'
import { suggestBinderOrder, type BinderSuggestion } from './domain/suggestions'
import { ScannerView } from './scanner/ScannerView'
import { CardFields, initialCard } from './CardFields'
import { CollectionView, type Commit } from './CollectionView'
import { CatalogIntake } from './catalog/CatalogIntake'

type View = 'home' | 'collection' | 'suggestions' | 'scanner'
type Loaded = { state: CollectionState; error?: never } | { error: string; state?: never }
const storage = createLocalStorage()
function loadCollection(): Loaded {
  try { return { state: storage.load() } } catch (error) {
    if (!(error instanceof StorageError)) throw error
    return { error: error.message }
  }
}

export function App() {
  const [view, setView] = useState<View>('home')
  const [loaded, setLoaded] = useState<Loaded>(loadCollection)
  const [card, setCard] = useState<NewCard>(initialCard)
  const [intakeMode, setIntakeMode] = useState<'manual' | 'catalog'>('manual')
  useEffect(() => {
    if (intakeMode === 'manual') document.getElementById('add-card-name')?.focus()
  }, [intakeMode])
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [theme, setTheme] = useState('')
  const [suggestion, setSuggestion] = useState<BinderSuggestion | null>(null)
  const cards = useMemo(() => loaded.state ? projectCards(loaded.state) : [], [loaded.state])
  const commit: Commit = (update, message) => {
    if (!loaded.state) return false
    try {
      const next = update(loaded.state)
      if (next !== loaded.state) storage.save(next)
      setLoaded({ state: next }); setError(''); setSavedMessage(message); setSuggestion(null)
      return true
    } catch (error) {
      if (!(error instanceof CollectionError) && !(error instanceof StorageError)) throw error
      setError(error.message); setSavedMessage('')
      return false
    }
  }
  function intake(draft: NewCard) {
    return commit((state) => addCopies(state, draft), `${draft.name.trim()} was added to your collection in Unsorted.`)
  }
  return <div className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => setView('home')} aria-label="Card Tracker home">CARD<span>TRACKER</span></button><nav aria-label="Primary navigation"><button className={view === 'collection' ? 'nav-link active' : 'nav-link'} onClick={() => setView('collection')}>Collection</button><button className={view === 'suggestions' ? 'nav-link active' : 'nav-link'} onClick={() => setView('suggestions')}>Binder ideas</button></nav></header>
    {!loaded.state ? <main className="page"><section className="panel" role="alert"><h1>Collection needs recovery</h1><p>{loaded.error}</p><p>Your stored data has not been reset. Restore a known-good backup or retry when browser storage is available.</p><button className="primary-button" onClick={() => setLoaded(loadCollection())}>Retry loading collection</button></section></main> : <>
      {error && <div className="app-feedback form-error" role="alert">{error}</div>}
      {savedMessage && <div className="app-feedback success-message" role="status">{savedMessage}</div>}
      {view === 'home' && <main className="hero-page">
        <div className="hero-copy"><h1>Build a binder<br /><em>worth showing off.</em></h1><p className="hero-text">Keep your Pokemon cards organized and discover thoughtful binder layouts around the themes you love.</p><div className="hero-actions"><button className="primary-button" onClick={() => setView('collection')}>Open my collection <span aria-hidden="true">-&gt;</span></button><button className="text-button" onClick={() => setView('suggestions')}>Explore binder ideas</button></div></div>
        <div className="hero-art" aria-label="Decorative card shapes"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="card-stack"><div className="mock-card back" /><div className="mock-card front"><span>PKMN</span><strong>01</strong><small>COLLECT<br />WITH INTENT</small></div></div></div>
        <section className="feature-strip"><div><strong>01</strong><span>Track every favorite</span></div><div><strong>02</strong><span>Find what fits together</span></div><div><strong>03</strong><span>Arrange it your way</span></div></section>
      </main>}
      {view === 'collection' && <main className="page collection-page">
        <div className="page-heading"><div><h1>My collection</h1><p>Every copy has a place. Keep bulk behind dividers and favorites in binders.</p></div><div className="collection-actions"><button className="secondary-button" onClick={() => setView('scanner')}>Scan a card</button><button className="primary-button" onClick={() => document.getElementById('add-card-heading')?.focus()}>+ Add a card</button></div></div>
        <CollectionView state={loaded.state} commit={commit} />
        <section className="panel add-panel collection-intake" aria-label="Add a card"><h2 id="add-card-heading" tabIndex={-1}>Add a card</h2><p>New copies always arrive in Bulk / Unsorted. Sort them whenever you're ready.</p>
        <div className="intake-modes" aria-label="Card entry method"><button type="button" className="secondary-button" aria-pressed={intakeMode === 'manual'} onClick={() => setIntakeMode('manual')}>Manual entry</button><button type="button" className="secondary-button" aria-pressed={intakeMode === 'catalog'} onClick={() => setIntakeMode('catalog')}>Search card catalog</button></div>
        {intakeMode === 'catalog' ? <CatalogIntake onSave={intake} onManual={(draft) => { if (draft) setCard(draft); setIntakeMode('manual') }} /> : <form noValidate onSubmit={(event) => {
          event.preventDefault()
          if (intake(card)) setCard(initialCard)
        }}><CardFields card={card} onChange={(change) => setCard((current) => ({ ...current, ...change }))} prefix="add-card" /><button className="primary-button" type="submit">Save card <span aria-hidden="true">-&gt;</span></button></form>}</section>
      </main>}
      {view === 'scanner' && <ScannerView onCancel={() => setView('collection')} onSave={(draft) => { if (intake(draft)) setView('collection') }} />}
      {view === 'suggestions' && <main className="page suggestion-page">
        <div className="page-heading"><div><h1>Binder ideas</h1><p>Explore a theme without moving any owned copies.</p></div><span className="collection-count">{cards.length} card entries available</span></div>
        <section className="suggestion-builder panel"><label htmlFor="theme">What story are you telling?</label><div className="suggestion-input"><input id="theme" value={theme} onChange={(event) => { setTheme(event.target.value); setSuggestion(null) }} placeholder="Try fire, water, evolution, or favorites" onKeyDown={(event) => event.key === 'Enter' && setSuggestion(suggestBinderOrder(cards, theme))} /><button className="primary-button" onClick={() => setSuggestion(suggestBinderOrder(cards, theme))}>Generate layout -&gt;</button></div><div className="theme-chips">{['Fire', 'Water', 'Evolution', 'Favorites'].map((item) => <button key={item} onClick={() => { setTheme(item); setSuggestion(null) }}>{item}</button>)}</div>{!theme.trim() && <p className="helper-text">Choose a theme to see how your cards could come together.</p>}</section>
        {suggestion && <section className="suggestion-result"><div className="result-heading"><div><h2>{suggestion.theme}</h2><p>{suggestion.rationale}</p><p>Preview only. No pockets are reserved and no copies have moved.</p></div><span className="result-count">{suggestion.cards.length} matching entries</span></div>{suggestion.cards.length ? <ol className="suggestion-list">{suggestion.cards.map((item) => <li key={item.id}><strong>{item.name}</strong><span>{item.set || 'Set not specified'} · {item.quantity} owned copies</span></li>)}</ol> : <div className="empty-state result-empty"><h3>No cards found for this theme</h3><p>Add cards with notes or names related to this theme, then try again.</p></div>}{suggestion.unclassified.length > 0 && <p className="unclassified"><strong>{suggestion.unclassified.length} card entries</strong> could not be classified because theme-related information is unavailable.</p>}</section>}
      </main>}
    </>}
  </div>
}
