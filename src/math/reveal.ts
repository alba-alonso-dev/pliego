import { clamp } from './easing'

/**
 * Revelado de un dibujo a mano: los trazos se dibujan uno detrás de otro,
 * como los haría una mano, a velocidad constante.
 */

/**
 * Cuántos tramos de cada trazo se ven para un avance `progress` (0–1).
 * `segments` es el número de tramos de cada trazo; como están repartidos a
 * intervalos parecidos, contar tramos equivale a medir longitud.
 */
export function visibleSegments(segments: number[], progress: number): number[] {
  const total = segments.reduce((sum, n) => sum + n, 0)
  let left = Math.round(clamp(progress) * total)
  return segments.map((n) => {
    const shown = Math.min(n, left)
    left -= shown
    return shown
  })
}

export interface RevealTiming {
  /** Segundos que tarda en dibujarse todo. */
  duration: number
  /** Segundos de espera desde que se abre el spread. */
  delay: number
}

export const DEFAULT_REVEAL: RevealTiming = { duration: 1.6, delay: 0.25 }

/** Avance del revelado (0–1) tras `elapsed` segundos con el spread abierto. */
export function revealProgress(elapsed: number, timing: RevealTiming = DEFAULT_REVEAL): number {
  if (timing.duration <= 0) return elapsed >= timing.delay ? 1 : 0
  return clamp((elapsed - timing.delay) / timing.duration)
}
