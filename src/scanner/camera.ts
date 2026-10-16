import type { CameraError, CapturedImage } from './types'

export const cameraConstraints: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
}

export function getCameraError(error: unknown): CameraError {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return { code: 'permission-denied', message: 'Camera access was denied. Allow camera access and try again.' }
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return { code: 'unavailable', message: 'No usable camera was found on this device.' }
    }
  }
  return { code: 'unknown', message: 'The camera could not be started. Try again or enter the card manually.' }
}

export async function requestCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw { code: 'unsupported', message: 'Camera scanning is not supported by this browser.' } satisfies CameraError
  }

  try {
    return await navigator.mediaDevices.getUserMedia(cameraConstraints)
  } catch (error) {
    throw getCameraError(error)
  }
}

export function stopCamera(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop())
}

export function captureFrame(video: HTMLVideoElement): CapturedImage {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    throw new Error('The camera preview is not ready to capture.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
  canvas.width = 0
  canvas.height = 0
  return { dataUrl, width: video.videoWidth, height: video.videoHeight }
}
