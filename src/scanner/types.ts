import type { NewCard } from '../domain/collection'

export type ScannerPhase = 'requesting' | 'live' | 'captured' | 'review' | 'error'

export type CameraErrorCode = 'unsupported' | 'permission-denied' | 'unavailable' | 'unknown'

export interface CameraError {
  code: CameraErrorCode
  message: string
}

export interface CapturedImage {
  dataUrl: string
  width: number
  height: number
}

export type AnalysisStatus = 'unavailable' | 'assessed' | 'failed'

export interface ScannerAnalysis {
  recognition: AnalysisStatus
  centering: AnalysisStatus
}

export interface ScannerDraft {
  image: CapturedImage
  card: NewCard
  analysis: ScannerAnalysis
}
