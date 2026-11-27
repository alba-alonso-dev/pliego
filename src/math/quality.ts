/**
 * Calidad adaptable: decide, a partir de la duración de los fotogramas
 * seguidos, si el dispositivo va justo (bajar la calidad) o sobrado
 * (recuperarla). Solo cuenta fotogramas seguidos: con el lienzo en reposo
 * no hay fotogramas y eso no es ir lento.
 */
export interface QualityState {
  /** Duraciones recientes de fotogramas seguidos, en segundos. */
  samples: number[]
  degraded: boolean
}

/** Por encima de esto (s) un fotograma no es «seguido»: el lienzo estaba en reposo. */
export const IDLE_GAP = 0.25
const WINDOW = 60
const SLOW = 1 / 30
const FAST = 1 / 50

export function qualityStep(state: QualityState, delta: number): QualityState {
  if (delta <= 0 || delta > IDLE_GAP) return state
  const samples = [...state.samples, delta].slice(-WINDOW)
  if (samples.length < WINDOW) return { ...state, samples }
  const average = samples.reduce((sum, d) => sum + d, 0) / samples.length
  if (!state.degraded && average > SLOW) return { samples: [], degraded: true }
  if (state.degraded && average < FAST) return { samples: [], degraded: false }
  return { ...state, samples }
}
