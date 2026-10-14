import type { Card } from './collection'

export interface BinderSuggestion {
  theme: string
  cards: Card[]
  unclassified: Card[]
  rationale: string
}

const themeKeywords: Record<string, string[]> = {
  fire: ['fire', 'charizard', 'charmander', 'vulpix', 'flareon'],
  water: ['water', 'squirtle', 'psyduck', 'lapras', 'vaporeon'],
  evolution: ['evolution', 'eevee', 'flareon', 'vaporeon', 'jolteon'],
  favorites: [],
}

export function suggestBinderOrder(cards: Card[], theme: string): BinderSuggestion | null {
  const normalizedTheme = theme.trim().toLowerCase()
  if (!normalizedTheme) return null
  const keywords = themeKeywords[normalizedTheme] ?? [normalizedTheme]
  const matching: Card[] = []
  const unclassified: Card[] = []

  for (const card of cards) {
    const searchable = `${card.name} ${card.type} ${card.notes}`.toLowerCase()
    if (normalizedTheme === 'favorites' || keywords.some((keyword) => searchable.includes(keyword))) {
      matching.push(card)
    } else if (!card.type || !card.notes) {
      unclassified.push(card)
    }
  }

  const ordered = [...matching].sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id))
  return {
    theme: theme.trim(),
    cards: ordered,
    unclassified,
    rationale: normalizedTheme === 'favorites'
      ? 'Favorites are grouped in alphabetical order.'
      : `Cards matching "${theme.trim()}" are grouped in alphabetical order.`,
  }
}
