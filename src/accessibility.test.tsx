import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { App } from './App'

vi.mock('./scanner/camera', () => ({
  requestCamera: vi.fn().mockRejectedValue({ code: 'unavailable', message: 'No usable camera was found on this device.' }),
  captureFrame: vi.fn(),
  getCameraError: vi.fn(),
  stopCamera: vi.fn(),
}))

describe('application accessibility', () => {
  it('has no automated accessibility violations on the landing view', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })

  it('has no automated accessibility violations on the scanner error state', async () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Open my collection/i }))
    fireEvent.click(screen.getByRole('button', { name: /Scan a card/i }))
    await screen.findByRole('heading', { name: /Camera unavailable/i })
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
