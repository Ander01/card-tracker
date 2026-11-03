import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CardArtwork } from './CardArtwork'

describe('card artwork', () => {
  it('uses thumbnail dimensions, lazy loading, alt text and explicit error fallback', () => {
    render(<CardArtwork baseUrl="https://assets.tcgdex.net/en/base/base1/4" name="Charizard, Base Set 4" />)
    const image = screen.getByRole('img', { name: 'Charizard, Base Set 4' })
    expect(image).toHaveAttribute('src', 'https://assets.tcgdex.net/en/base/base1/4/low.webp')
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).toHaveAttribute('width', '245')
    fireEvent.error(image)
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByText('Artwork unavailable')).toBeTruthy()
  })

  it('shows missing artwork and recovers when its source changes after failure', () => {
    const { rerender } = render(<CardArtwork name="Manual card" />)
    expect(screen.getByText('Artwork unavailable')).toBeTruthy()
    rerender(<CardArtwork name="Card" baseUrl="https://assets.tcgdex.net/en/base/base1/4" />)
    fireEvent.error(screen.getByRole('img'))
    rerender(<CardArtwork name="Other" baseUrl="https://assets.tcgdex.net/en/base/base1/5" large />)
    expect(screen.getByRole('img', { name: 'Other' })).toHaveAttribute('src', 'https://assets.tcgdex.net/en/base/base1/5/high.webp')
    rerender(<CardArtwork name="Original" baseUrl="https://assets.tcgdex.net/en/base/base1/4" />)
    expect(screen.getByRole('img', { name: 'Original' })).toBeTruthy()
  })
})
