import { clamp } from './easing'

/**
 * Matemática de los gestos: convierten lo que hace la mano (arrastrar,
 * mantener pulsado, hacer clic) en un progreso entre 0 y 1.
 */

/** Progreso al arrastrar `delta` píxeles; `distance` píxeles recorren todo el rango. */
export function dragProgress(start: number, delta: number, distance: number): number {
  if (distance <= 0) return clamp(start)
  return clamp(start + delta / distance)
}

/**
 * Un paso de «mantener pulsado»: sube mientras se mantiene y, al soltar,
 * se queda (`stay`) o vuelve a 0 (`return`). `duration` en segundos para
 * recorrer todo el rango.
 */
export function holdStep(
  progress: number,
  delta: number,
  duration: number,
  holding: boolean,
  release: 'stay' | 'return' = 'stay',
): number {
  if (duration <= 0) return holding ? 1 : release === 'return' ? 0 : progress
  if (holding) return clamp(progress + delta / duration)
  if (release === 'return') return clamp(progress - delta / duration)
  return progress
}

/** Acerca `progress` a `target` a ritmo constante (`duration` segundos para todo el rango). */
export function approach(
  progress: number,
  target: number,
  delta: number,
  duration: number,
): number {
  if (duration <= 0) return target
  const step = delta / duration
  if (Math.abs(target - progress) <= step) return target
  return progress + Math.sign(target - progress) * step
}
