import { cardTypes, elementalTypes, generations, rarities, type NewCard } from './domain/collection'

export const initialCard: NewCard = { name: '', set: '', type: 'Pokemon', rarity: 'Common', quantity: 1, notes: '', elementalTypes: [], generations: [] }

export function CardFields({ card, onChange, prefix }: { card: NewCard; onChange: (change: Partial<NewCard>) => void; prefix: string }) {
  return <>
    <label htmlFor={`${prefix}-name`}>Card name<input id={`${prefix}-name`} value={card.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="e.g. Umbreon" /></label>
    <label>Set<input value={card.set} onChange={(event) => onChange({ set: event.target.value })} placeholder="e.g. Neo Discovery" /></label>
    <div className="form-grid">
      <label>Card kind<select value={card.type} onChange={(event) => {
        const type = cardTypes.find((type) => type === event.target.value)
        if (type) onChange({ type })
      }}>{cardTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>Rarity<input list={`${prefix}-rarities`} value={card.rarity ?? ''} placeholder="Unknown" onChange={(event) => onChange({ rarity: event.target.value || undefined })} /><datalist id={`${prefix}-rarities`}>{rarities.map((rarity) => <option key={rarity} value={rarity} />)}</datalist></label>
    </div>
    <details><summary>Elemental typing and Pokemon generation (optional)</summary>
      <fieldset><legend>Elemental typing</legend>{elementalTypes.map((type) => <label className="check-label" key={type}><input type="checkbox" checked={card.elementalTypes?.includes(type) ?? false} onChange={(event) => onChange({ elementalTypes: event.target.checked ? [...(card.elementalTypes ?? []), type] : card.elementalTypes?.filter((value) => value !== type) })} />{type}</label>)}</fieldset>
      <fieldset><legend>Pokemon generation</legend>{generations.map((generation) => <label className="check-label" key={generation}><input type="checkbox" checked={card.generations?.includes(generation) ?? false} onChange={(event) => onChange({ generations: event.target.checked ? [...(card.generations ?? []), generation] : card.generations?.filter((value) => value !== generation) })} />Generation {generation}</label>)}</fieldset>
      <p className="helper-text">Leave unavailable metadata unknown; nothing is inferred from the name.</p>
    </details>
    <label>Quantity<input type="number" min="1" step="1" value={card.quantity} onChange={(event) => onChange({ quantity: event.target.value === '' ? 0 : Number(event.target.value) })} /></label>
    <label>Notes <span className="optional">Optional</span><textarea value={card.notes} onChange={(event) => onChange({ notes: event.target.value })} placeholder="Why this card matters..." rows={3} /></label>
  </>
}
