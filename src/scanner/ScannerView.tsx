import { useEffect, useRef, useState } from 'react'
import {
  cardTypes,
  rarities,
  validateCard,
  type NewCard,
} from '../domain/collection'
import { captureFrame, getCameraError, requestCamera, stopCamera } from './camera'
import type { CameraError, CapturedImage, ScannerPhase } from './types'

const initialCard: NewCard = { name: '', set: '', type: 'Pokemon', rarity: 'Common', quantity: 1, notes: '' }

interface ScannerViewProps {
  onCancel: () => void
  onSave: (card: NewCard) => void
}

export function ScannerView({ onCancel, onSave }: ScannerViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mountedRef = useRef(true)
  const cameraRequestRef = useRef(0)
  const [phase, setPhase] = useState<ScannerPhase>('requesting')
  const [cameraError, setCameraError] = useState<CameraError | null>(null)
  const [captured, setCaptured] = useState<CapturedImage | null>(null)
  const [card, setCard] = useState<NewCard>(initialCard)
  const [formError, setFormError] = useState('')

  function beginCamera() {
    const requestId = ++cameraRequestRef.current
    setPhase('requesting')
    setCameraError(null)
    void requestCamera().then((stream) => {
      if (!mountedRef.current || requestId !== cameraRequestRef.current) {
        stopCamera(stream)
        return
      }
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setPhase('live')
    }).catch((error: unknown) => {
      if (!mountedRef.current || requestId !== cameraRequestRef.current) return
      const mapped = isCameraError(error) ? error : getCameraError(error)
      setCameraError(mapped)
      setPhase('error')
    })
  }

  useEffect(() => {
    mountedRef.current = true
    beginCamera()
    return () => {
      mountedRef.current = false
      cameraRequestRef.current += 1
      stopCamera(streamRef.current)
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
      setCaptured(null)
    }
  }, [])

  useEffect(() => {
    if (phase === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [phase])

  function updateCard(change: Partial<NewCard>) {
    setCard((current) => ({ ...current, ...change }))
    setFormError('')
  }

  function closeCamera() {
    stopCamera(streamRef.current)
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  function handleCancel() {
    cameraRequestRef.current += 1
    closeCamera()
    setCaptured(null)
    onCancel()
  }

  function handleCapture() {
    if (!videoRef.current) return
    try {
      setCaptured(captureFrame(videoRef.current))
      closeCamera()
      setPhase('captured')
    } catch (error) {
      setCameraError({ code: 'unknown', message: error instanceof Error ? error.message : 'The card image could not be captured.' })
      setPhase('error')
    }
  }

  function handleRetake() {
    setCaptured(null)
    setCameraError(null)
    closeCamera()
    beginCamera()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateCard(card)
    if (Object.keys(errors).length > 0) {
      setFormError(errors.name || errors.quantity || 'Complete the required card details.')
      return
    }
    onSave(card)
  }

  if (phase === 'requesting') {
    return <main className="page scanner-page"><ScannerHeader onCancel={handleCancel} /><section className="panel scanner-status" aria-live="polite"><h2>Starting your camera...</h2><p>Allow camera access when your browser asks so we can show the card placement guide.</p></section></main>
  }

  if (phase === 'error') {
    return <main className="page scanner-page"><ScannerHeader onCancel={handleCancel} /><section className="panel scanner-status" role="alert"><h2>Camera unavailable</h2><p>{cameraError?.message}</p><div className="scanner-actions"><button className="primary-button" onClick={handleRetake}>Try camera again</button><button className="text-button" onClick={handleCancel}>Use manual entry</button></div></section></main>
  }

  if (phase === 'captured' && captured) {
    return <main className="page scanner-page"><ScannerHeader onCancel={handleCancel} /><section className="panel capture-review"><p className="eyebrow">CAPTURE REVIEW</p><h2>Does the card look clear?</h2><img className="capture-image" src={captured.dataUrl} alt="Captured card preview" /><p className="helper-text">Retake the image if the card is blurry, cut off, or has glare.</p><div className="scanner-actions"><button className="primary-button" onClick={() => setPhase('review')}>Use this capture</button><button className="text-button" onClick={handleRetake}>Retake</button></div></section></main>
  }

  if (phase === 'review' && captured) {
    return <main className="page scanner-page"><ScannerHeader onCancel={handleCancel} /><section className="panel scan-form-panel"><div className="review-heading"><div><p className="eyebrow">REVIEW DETAILS</p><h2>Add this card to your collection</h2></div><img className="review-thumbnail" src={captured.dataUrl} alt="Captured card preview" /></div><div className="analysis-status" aria-live="polite"><strong>Analysis not available yet</strong><span>Card identification and grading centering will be added in a future model feature.</span></div><form onSubmit={handleSubmit}><label htmlFor="scan-card-name">Card name<input id="scan-card-name" value={card.name} onChange={(event) => updateCard({ name: event.target.value })} placeholder="e.g. Umbreon" /></label><label>Set<input value={card.set} onChange={(event) => updateCard({ set: event.target.value })} placeholder="e.g. Neo Discovery" /></label><div className="form-grid"><label>Type<select value={card.type} onChange={(event) => updateCard({ type: event.target.value as NewCard['type'] })}>{cardTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>Rarity<select value={card.rarity} onChange={(event) => updateCard({ rarity: event.target.value as NewCard['rarity'] })}>{rarities.map((rarity) => <option key={rarity}>{rarity}</option>)}</select></label></div><label>Quantity<input type="number" min="1" value={card.quantity} onChange={(event) => updateCard({ quantity: Number(event.target.value) })} /></label><label>Notes <span className="optional">Optional</span><textarea value={card.notes} onChange={(event) => updateCard({ notes: event.target.value })} placeholder="Why this card matters..." rows={3} /></label>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="scanner-actions"><button className="primary-button" type="submit">Save card <span aria-hidden="true">-&gt;</span></button><button className="text-button" type="button" onClick={handleCancel}>Discard capture</button></div></form></section></main>
  }

  return <main className="page scanner-page"><ScannerHeader onCancel={onCancel} /><section className="panel camera-panel"><div className="camera-frame"><video ref={videoRef} autoPlay muted playsInline aria-label="Live camera preview" /><div className="card-guide" aria-hidden="true" /></div><p className="camera-instructions">Place one card inside the frame. Keep the card flat, fully visible, and free from glare.</p><button className="primary-button full-width" onClick={handleCapture}>Capture card</button></section></main>
}

function ScannerHeader({ onCancel }: { onCancel: () => void }) {
  return <div className="page-heading scanner-heading"><div><p className="eyebrow">CARD SCANNER</p><h1>Capture a card</h1><p>Use your webcam or phone camera to prepare a card for review.</p></div><button className="text-button" onClick={onCancel}>Cancel</button></div>
}

function isCameraError(error: unknown): error is CameraError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}
