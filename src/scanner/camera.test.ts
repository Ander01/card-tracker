import { beforeEach, describe, expect, it, vi } from 'vitest'
import { captureFrame, getCameraError, requestCamera, stopCamera } from './camera'

describe('camera session helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('requests a rear-camera-preferred video stream', async () => {
    const stream = { getTracks: vi.fn(() => []) } as unknown as MediaStream
    const getUserMedia = vi.fn().mockResolvedValue(stream)
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })

    await expect(requestCamera()).resolves.toBe(stream)
    expect(getUserMedia).toHaveBeenCalledWith(expect.objectContaining({
      audio: false,
      video: expect.objectContaining({ facingMode: { ideal: 'environment' } }),
    }))
  })

  it('maps permission and missing-device errors', () => {
    expect(getCameraError(new DOMException('blocked', 'NotAllowedError')).code).toBe('permission-denied')
    expect(getCameraError(new DOMException('missing', 'NotFoundError')).code).toBe('unavailable')
  })

  it('stops every track when the session closes', () => {
    const first = { stop: vi.fn() }
    const second = { stop: vi.fn() }
    stopCamera({ getTracks: () => [first, second] } as unknown as MediaStream)
    expect(first.stop).toHaveBeenCalledOnce()
    expect(second.stop).toHaveBeenCalledOnce()
  })

  it('captures a frame and clears the temporary canvas', () => {
    const context = { drawImage: vi.fn() }
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,capture'),
    }
    vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLElement)
    const video = { videoWidth: 630, videoHeight: 880 } as HTMLVideoElement

    expect(captureFrame(video)).toEqual({ dataUrl: 'data:image/jpeg;base64,capture', width: 630, height: 880 })
    expect(context.drawImage).toHaveBeenCalled()
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)
  })
})
