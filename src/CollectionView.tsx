import { useMemo, useRef, useState } from 'react'
import {
  binderCapacity, cardTypes, deleteContainer, elementalTypes, emptyCopyFilters, filterCopies,
  euroInput, formatEuro, generations, hasUnsorted, moveCopies, rarities, requireValid, saveBinder, saveCategory, setCopyValue,
  type Binder, type CollectionState, type CopyFilters, type Location, type OwnedCopy, type Scope,
} from './domain/collection'

export type Commit = (update: (state: CollectionState) => CollectionState, message: string) => boolean
type Selection = { kind: 'new-category' } | { kind: 'category'; id: string } | { kind: 'new-binder' } | { kind: 'binder'; id: string } | null

export function CollectionView({ state, commit }: { state: CollectionState; commit: Commit }) {
  const [scope, setScope] = useState<Scope>({ kind: 'all' })
  const [page, setPage] = useState(0)
  const [targetPocket, setTargetPocket] = useState<number | null>(null)
  const [pageInput, setPageInput] = useState<string | null>(null)
  const [filters, setFilters] = useState<CopyFilters>(emptyCopyFilters)
  const [selected, setSelected] = useState<string[]>([])
  const [editing, setEditing] = useState<Selection>(null)
  const [deleting, setDeleting] = useState<{ kind: 'category' | 'binder'; id: string; name: string } | null>(null)
  const [moving, setMoving] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const unsorted = hasUnsorted(state)
  const effectiveScope: Scope = scope.kind === 'unsorted' && !unsorted ? { kind: 'bulk' } : scope
  const binder = effectiveScope.kind === 'binder' ? state.binders.find((item) => item.id === effectiveScope.id) : undefined
  const currentPage = binder ? Math.min(page, binder.pageCount - 1) : 0
  const visible = useMemo(() => filterCopies(state, filters, effectiveScope), [state, filters, effectiveScope])
  const entries = useMemo(() => new Map(state.entries.map((entry) => [entry.id, entry])), [state.entries])
  const title = binder?.name ?? (effectiveScope.kind === 'category' ? state.categories.find((category) => category.id === effectiveScope.id)?.name : effectiveScope.kind === 'unsorted' ? 'Unsorted' : effectiveScope.kind === 'bulk' ? 'Bulk box' : 'All cards')
  const focusHeading = () => heading.current?.focus()
  function navigate(next: Scope, nextPage = 0, pocket: number | null = null) {
    setScope(next); setPage(nextPage); setPageInput(null); setTargetPocket(pocket); setSelected([]); setMoving(false); setEditing(null); setDeleting(null)
  }
  function locationName(location: Location) {
    if (location.kind === 'unsorted') return 'Bulk / Unsorted'
    if (location.kind === 'category') return `Bulk / ${state.categories.find((category) => category.id === location.categoryId)?.name}`
    return `${state.binders.find((binder) => binder.id === location.binderId)?.name} / Page ${location.page + 1} / Pocket ${location.pocket + 1}`
  }
  function toggle(id: string) { setSelected((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]) }
  function renderCopy(copy: OwnedCopy) {
    const entry = entries.get(copy.entryId)!
    const ordinal = state.copies.filter((item) => item.entryId === copy.entryId).findIndex((item) => item.id === copy.id) + 1
    return <article className="owned-copy" key={copy.id}>
      <label className="check-label"><input type="checkbox" checked={selected.includes(copy.id)} onChange={() => toggle(copy.id)} /><span>Select {entry.name} copy {ordinal}</span></label>
      <h3>{entry.name}</h3>
      <details className="copy-details" open={!binder}><summary>Copy details and value</summary>
      <p className="copy-metadata">{entry.set || 'Set unknown'} · {entry.type} · {entry.rarity}</p>
      <p className="copy-metadata">Typing: {entry.elementalTypes?.join(', ') || 'Unknown'} · Generation: {entry.generations?.join(', ') || 'Unknown'}</p>
      {entry.notes && <p className="copy-metadata">{entry.notes}</p>}
      {copy.location.kind === 'binder' ? <button className="location-link" onClick={() => {
        const location = copy.location
        if (location.kind === 'binder') { navigate({ kind: 'binder', id: location.binderId }, location.page, location.pocket); focusHeading() }
      }}>{locationName(copy.location)}</button> : <p className="copy-location">{locationName(copy.location)}</p>}
      <ValueEditor key={`${copy.id}-${copy.valueCents}`} copy={copy} label={`${entry.name} copy ${ordinal}`} commit={commit} />
      </details>
    </article>
  }
  return <section className="organization">
    <aside className="collection-sidebar" aria-label="Collection organization">
      <button aria-pressed={effectiveScope.kind === 'all'} onClick={() => navigate({ kind: 'all' })}>All cards <span>{state.copies.length}</span></button>
      <button aria-pressed={effectiveScope.kind === 'bulk'} onClick={() => navigate({ kind: 'bulk' })}>Bulk box <span>{state.copies.filter((copy) => copy.location.kind !== 'binder').length}</span></button>
      <div className="divider-list">
        {unsorted && <button aria-pressed={effectiveScope.kind === 'unsorted'} onClick={() => navigate({ kind: 'unsorted' })}>Unsorted <span>{state.copies.filter((copy) => copy.location.kind === 'unsorted').length}</span></button>}
        {state.categories.map((category) => <div key={category.id} className="container-item"><button aria-pressed={effectiveScope.kind === 'category' && effectiveScope.id === category.id} onClick={() => navigate({ kind: 'category', id: category.id })}>{category.name}</button><button aria-label={`Edit category ${category.name}`} onClick={() => setEditing({ kind: 'category', id: category.id })}>Edit</button><button aria-label={`Delete category ${category.name}`} onClick={() => setDeleting({ kind: 'category', ...category })}>Delete</button></div>)}
      </div>
      <button className="small-button" onClick={() => setEditing({ kind: 'new-category' })}>+ Add category</button>
      <h2>Binders</h2>
      {state.binders.length === 0 && <p className="helper-text">Create a binder to give your favorites a page.</p>}
      {state.binders.map((item) => <div className="binder-item" key={item.id}>
        <button className="binder-cover" aria-pressed={binder?.id === item.id} onClick={() => navigate({ kind: 'binder', id: item.id })}><span className="cover-swatch" style={{ backgroundColor: item.color }} aria-hidden="true" /><strong>{item.name}</strong><small>{state.copies.filter((copy) => copy.location.kind === 'binder' && copy.location.binderId === item.id).length} / {binderCapacity(item)} pockets</small></button>
        <div className="inline-actions"><button className="small-button" aria-label={`Edit binder ${item.name}`} onClick={() => setEditing({ kind: 'binder', id: item.id })}>Edit</button><button className="small-button" aria-label={`Delete binder ${item.name}`} onClick={() => setDeleting({ kind: 'binder', id: item.id, name: item.name })}>Delete</button></div>
      </div>)}
      <button className="secondary-button" onClick={() => setEditing({ kind: 'new-binder' })}>+ Create binder</button>
    </aside>
    <div className="organization-main">
      <div className="panel-heading"><div><h2 ref={heading} tabIndex={-1}>{title}</h2><p>{state.copies.length} owned copies · {state.entries.length} distinct entries</p></div></div>
      {editing && <ContainerEditor key={`${editing.kind}-${'id' in editing ? editing.id : ''}`} selection={editing} state={state} commit={commit} close={() => { setEditing(null); focusHeading() }} />}
      {deleting && <section className="editing-panel" aria-label="Confirm deletion"><h3>Delete {deleting.name}?</h3><p>All copies in this {deleting.kind} will return to Unsorted. No cards or values will be deleted.</p><div className="inline-actions"><button className="primary-button" onClick={() => {
        if (commit((current) => deleteContainer(current, deleting.kind, deleting.id), `${deleting.name} deleted; copies returned to Unsorted.`)) { navigate({ kind: 'bulk' }); focusHeading() }
      }}>Confirm deletion</button><button className="secondary-button" onClick={() => { setDeleting(null); focusHeading() }}>Cancel deletion</button></div></section>}
      {!binder && <CopyFilterForm filters={filters} state={state} onApply={(next) => {
        const success = commit((current) => { filterCopies(current, next, effectiveScope); return current }, 'Filters applied; card locations are unchanged.')
        if (success) { setFilters(next); setSelected([]); setMoving(false) }
      }} />}
      <div className="selection-bar"><span>{binder ? `${binder.rows * binder.columns} pockets per page` : `${visible.length} matching copies`}</span><button className="secondary-button" disabled={!selected.length} onClick={() => setMoving(true)}>Move selected ({selected.length})</button></div>
      {moving && <MoveForm state={state} ids={selected} commit={commit} close={() => { setMoving(false); setSelected([]); focusHeading() }} />}
      {binder ? <>
        <form className="page-controls" aria-label="Binder page navigation" noValidate onSubmit={(event) => {
          event.preventDefault()
          const value = Number(pageInput ?? currentPage + 1)
          if (commit((current) => { requireValid(Number.isInteger(value) && value >= 1 && value <= binder.pageCount, `Choose a whole page number from 1 to ${binder.pageCount}.`); return current }, `Opened page ${value}.`)) { setPage(value - 1); setPageInput(null); setTargetPocket(null) }
        }}>
          <button type="button" className="secondary-button" disabled={currentPage === 0} onClick={() => { setPage(currentPage - 1); setPageInput(null); setTargetPocket(null) }}>Previous page</button>
          <label>Page<input aria-label="Page number" type="number" min="1" max={binder.pageCount} value={pageInput ?? currentPage + 1} onChange={(event) => setPageInput(event.target.value)} /></label><span>of {binder.pageCount}</span><button className="small-button">Go to page</button>
          <button type="button" className="secondary-button" disabled={currentPage === binder.pageCount - 1} onClick={() => { setPage(currentPage + 1); setPageInput(null); setTargetPocket(null) }}>Next page</button>
        </form>
        <p className="helper-text">One copy per pocket. To expand, edit the binder's page count. Search in All cards to find a saved location.</p>
        <div role="group" className="physical-page" key={`${binder.id}-${currentPage}`} style={{ gridTemplateColumns: `repeat(${binder.columns}, minmax(0, 1fr))` }} aria-label={`Page ${currentPage + 1}`}>
          {Array.from({ length: binder.rows * binder.columns }, (_, pocket) => {
            const copy = state.copies.find((copy) => copy.location.kind === 'binder' && copy.location.binderId === binder.id && copy.location.page === currentPage && copy.location.pocket === pocket)
            return <div className={`physical-pocket${targetPocket === pocket ? ' located-pocket' : ''}`} key={pocket} data-pocket={pocket + 1}><span className="pocket-number">Pocket {pocket + 1}</span>{copy ? renderCopy(copy) : <p className="empty-pocket">Empty pocket</p>}</div>
          })}
        </div>
      </> : visible.length ? <div className="owned-list">{visible.map(renderCopy)}</div> : <div className="empty-state"><h3>{state.copies.length ? 'No cards match those filters' : 'Your collection is waiting'}</h3><p>{state.copies.length ? 'Try clearing filters or choosing another section.' : 'Add your first card. New copies wait in Unsorted until you organize them.'}</p></div>}
    </div>
  </section>
}

function ValueEditor({ copy, label, commit }: { copy: OwnedCopy; label: string; commit: Commit }) {
  const [value, setValue] = useState(euroInput(copy.valueCents))
  return <form className="value-editor" noValidate onSubmit={(event) => { event.preventDefault(); commit((state) => setCopyValue(state, copy.id, value), 'Copy value saved.') }}>
    <span>{formatEuro(copy.valueCents)}</span><label>Value (EUR)<input aria-label={`Value for ${label} (EUR)`} inputMode="decimal" placeholder="Unknown" value={value} onChange={(event) => setValue(event.target.value)} /></label><button className="small-button" aria-label={`Save value for ${label}`}>Save value</button>
  </form>
}

function CopyFilterForm({ filters, state, onApply }: { filters: CopyFilters; state: CollectionState; onApply: (next: CopyFilters) => void }) {
  const [draft, setDraft] = useState(filters)
  const update = (key: keyof CopyFilters, value: string) => setDraft((current) => ({ ...current, [key]: value }))
  const selects: { key: keyof CopyFilters; label: string; options: readonly string[] }[] = [
    { key: 'type', label: 'Card kind', options: cardTypes }, { key: 'rarity', label: 'Rarity', options: rarities },
    { key: 'elementalType', label: 'Elemental typing', options: elementalTypes }, { key: 'generation', label: 'Generation', options: generations },
  ]
  return <form className="copy-filters" noValidate onSubmit={(event) => { event.preventDefault(); onApply(draft) }}>
    <label>Search<input value={draft.query} onChange={(event) => update('query', event.target.value)} placeholder="Card name..." /></label>
    <label>Set<select value={draft.set} onChange={(event) => update('set', event.target.value)}><option value="">All sets</option>{[...new Set(state.entries.map((entry) => entry.set).filter(Boolean))].map((set) => <option key={set}>{set}</option>)}</select></label>
    {selects.map(({ key, label, options }) => <label key={key}>{label}<select value={draft[key]} onChange={(event) => update(key, event.target.value)}><option value="">All / unknown included</option>{options.map((option) => <option key={option} value={option}>{key === 'generation' ? `Generation ${option}` : option}</option>)}</select></label>)}
    <label>Minimum value (EUR)<input inputMode="decimal" value={draft.minValue} onChange={(event) => update('minValue', event.target.value)} /></label>
    <label>Maximum value (EUR)<input inputMode="decimal" value={draft.maxValue} onChange={(event) => update('maxValue', event.target.value)} /></label>
    <div className="inline-actions"><button className="primary-button">Apply filters</button><button type="button" className="text-button" onClick={() => { setDraft(emptyCopyFilters); onApply(emptyCopyFilters) }}>Clear filters</button></div>
  </form>
}

function ContainerEditor({ selection, state, commit, close }: { selection: NonNullable<Selection>; state: CollectionState; commit: Commit; close: () => void }) {
  const category = selection.kind === 'category' ? state.categories.find((item) => item.id === selection.id) : undefined
  const previous = selection.kind === 'binder' ? state.binders.find((item) => item.id === selection.id) : undefined
  const isBinder = selection.kind === 'binder' || selection.kind === 'new-binder'
  const [name, setName] = useState(previous?.name ?? category?.name ?? '')
  const [config, setConfig] = useState<Binder>(previous ?? { id: crypto.randomUUID(), name: '', color: '#526057', pageCount: 20, rows: 3, columns: 3 })
  return <form className="editing-panel" aria-label={isBinder ? 'Binder configuration' : 'Category configuration'} noValidate onSubmit={(event) => {
    event.preventDefault()
    if (commit((current) => isBinder ? saveBinder(current, { ...config, name }) : saveCategory(current, name, category?.id), isBinder ? 'Binder saved.' : 'Category saved.')) close()
  }}>
    <h3>{previous || category ? 'Edit' : 'Create'} {isBinder ? 'binder' : 'category'}</h3>
    <label>{isBinder ? 'Binder name' : 'Category name'}<input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>
    {isBinder && <><div className="config-grid"><label>Cover color<input type="color" value={config.color} onChange={(event) => setConfig({ ...config, color: event.target.value })} /></label>
      {(['pageCount', 'rows', 'columns'] as const).map((field) => <label key={field}>{field === 'pageCount' ? 'Page count' : field === 'rows' ? 'Rows per page' : 'Columns per page'}<input type="number" min="1" step="1" value={config[field]} onChange={(event) => setConfig({ ...config, [field]: Number(event.target.value) })} /></label>)}</div>
      <p>{config.rows * config.columns} pockets per page · {binderCapacity(config)} total pockets</p><p className="helper-text">Pages never grow automatically. Empty the binder before changing its grid; removed pages must be empty.</p></>}
    <div className="inline-actions"><button className="primary-button">{isBinder ? 'Save binder' : 'Save category'}</button><button className="text-button" type="button" onClick={close}>Cancel editing</button></div>
  </form>
}

function MoveForm({ state, ids, commit, close }: { state: CollectionState; ids: string[]; commit: Commit; close: () => void }) {
  const [destinations, setDestinations] = useState(new Map<string, { target: string; page: number; pocket: number }>())
  return <form className="editing-panel" aria-label="Move copies" noValidate onSubmit={(event) => {
    event.preventDefault()
    const moves = ids.map((copyId) => {
      const { target, page, pocket } = destinations.get(copyId) ?? { target: 'unsorted', page: 1, pocket: 1 }
      const location: Location = target === 'unsorted' ? { kind: 'unsorted' } : target.startsWith('category:') ? { kind: 'category', categoryId: target.slice(9) } : { kind: 'binder', binderId: target.slice(7), page: page - 1, pocket: pocket - 1 }
      return { copyId, location }
    })
    if (commit((current) => moveCopies(current, moves), `${ids.length} copies moved; ownership is unchanged.`)) close()
  }}>
    <h3>Move selected copies</h3><p>Choose an explicit destination for each copy. The whole move succeeds together, or nothing moves.</p>
    {ids.map((id, index) => {
      const copy = state.copies.find((copy) => copy.id === id)
      const entry = state.entries.find((entry) => entry.id === copy?.entryId)
      const destination = destinations.get(id) ?? { target: 'unsorted', page: 1, pocket: 1 }
      const update = (change: Partial<typeof destination>) => setDestinations((current) => new Map(current).set(id, { ...destination, ...change }))
      const targetBinder = state.binders.find((binder) => `binder:${binder.id}` === destination.target)
      const full = targetBinder && state.copies.filter((copy) => copy.location.kind === 'binder' && copy.location.binderId === targetBinder.id).length === binderCapacity(targetBinder)
      return <fieldset key={id}><legend>{entry?.name ?? 'Missing copy'} · selected copy {index + 1}</legend>
        <label>Destination for copy {index + 1}<select autoFocus={index === 0} value={destination.target} onChange={(event) => update({ target: event.target.value })}><option value="unsorted">Bulk / Unsorted</option>{state.categories.map((category) => <option key={category.id} value={`category:${category.id}`}>Bulk / {category.name}</option>)}{state.binders.map((binder) => <option key={binder.id} value={`binder:${binder.id}`}>{binder.name}</option>)}</select></label>
        {targetBinder && <><p className="helper-text">{full ? 'Binder is full. Add pages or free a pocket before moving a copy here.' : 'Choose an empty pocket; occupied pockets are never replaced.'}</p><div className="form-grid"><label>Destination page for copy {index + 1}<input type="number" min="1" max={targetBinder.pageCount} value={destination.page} onChange={(event) => update({ page: Number(event.target.value) })} /></label><label>Destination pocket for copy {index + 1}<input type="number" min="1" max={targetBinder.rows * targetBinder.columns} value={destination.pocket} onChange={(event) => update({ pocket: Number(event.target.value) })} /></label></div></>}
      </fieldset>
    })}
    <div className="inline-actions"><button className="primary-button">Confirm move</button><button className="text-button" type="button" onClick={close}>Cancel move</button></div>
  </form>
}
