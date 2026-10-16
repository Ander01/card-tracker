import { StrictMode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ScannerView } from './ScannerView'
import * as camera from './camera'

vi.mock('./camera', async () => {
  const actual = await vi.importActual<typeof import('./camera')>('./camera')
  return { ...actual, requestCamera: vi.fn(), captureFrame: vi.fn(), stopCamera: vi.fn() }
})

describe('ScannerView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(camera.requestCamera).mockResolvedValue({ getTracks: () => [] } as unknown as MediaStream)
    vi.mocked(camera.captureFrame).mockReturnValue({
      dataUrl: 'data:image/jpeg;base64,capture',
      width: 630,
      height: 880,
    })
  })

  it('shows the live placement guide and captures a review image', async () => {
    render(<ScannerView onCancel={vi.fn()} onSave={vi.fn()} />)

    expect(await screen.findByRole('button', { name: 'Capture card' })).toBeTruthy()
    expect(screen.getByText(/Place one card inside the frame/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Capture card' }))

    expect(screen.getByRole('img', { name: 'Captured card preview' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Use this capture' }))
    expect(screen.getByText(/Analysis not available yet/i)).toBeTruthy()
  })

  it('starts the camera during the Strict Mode effect lifecycle', async () => {
    render(
      <StrictMode>
        <ScannerView onCancel={vi.fn()} onSave={vi.fn()} />
      </StrictMode>,
    )

    expect(await screen.findByRole('button', { name: 'Capture card' })).toBeTruthy()
    expect(camera.requestCamera).toHaveBeenCalledTimes(2)
  })

  it('requires metadata before saving a reviewed capture', async () => {
    const onSave = vi.fn()
    render(<ScannerView onCancel={vi.fn()} onSave={onSave} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Capture card' }))
    fireEvent.click(screen.getByRole('button', { name: 'Use this capture' }))
    fireEvent.click(screen.getByRole('button', { name: /Save card/i }))
    expect(screen.getByRole('alert').textContent).toMatch(/Card name is required/i)
    expect(onSave).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Card name'), { target: { value: 'Pikachu' } })
    fireEvent.click(screen.getByRole('button', { name: /Save card/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pikachu' })))
  })

  it('supports canceling without saving a card', async () => {
    const onCancel = vi.fn()
    render(<ScannerView onCancel={onCancel} onSave={vi.fn()} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
