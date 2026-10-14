import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

describe('Card Tracker app shell', () => {
  beforeEach(() => localStorage.clear())

  it('explains the product and navigates to the collection', () => {
    render(<App />)
    expect(screen.getByText(/Build a binder/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Open my collection/i }))
    expect(screen.getByRole('heading', { name: /My collection/i })).toBeTruthy()
  })

  it('validates and saves a card from the collection form', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Open my collection/i }))
    fireEvent.click(screen.getByRole('button', { name: /Save card/i }))
    expect(screen.getByRole('alert').textContent).toMatch(/Card name is required/i)
    fireEvent.change(screen.getByLabelText('Card name'), { target: { value: 'Pikachu' } })
    fireEvent.click(screen.getByRole('button', { name: /Save card/i }))
    expect(screen.getByText('Pikachu')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toMatch(/was added/i)
  })

  it('generates a binder layout from a selected theme', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Open my collection/i }))
    fireEvent.change(screen.getByLabelText('Card name'), { target: { value: 'Charizard' } })
    fireEvent.change(screen.getByPlaceholderText('Why this card matters...'), { target: { value: 'fire favorite' } })
    fireEvent.click(screen.getByRole('button', { name: /Save card/i }))
    fireEvent.click(screen.getByRole('button', { name: /Binder ideas/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Fire' }))
    fireEvent.click(screen.getByRole('button', { name: /Generate layout/i }))
    expect(screen.getByRole('heading', { name: 'Fire' })).toBeTruthy()
    expect(screen.getByText('Charizard')).toBeTruthy()
  })
})
