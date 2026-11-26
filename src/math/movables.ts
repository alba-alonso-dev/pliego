import { clamp } from './easing'

/**
 * Avance de una pieza enlazada a una lengüeta: no empieza a moverse hasta
 * que la lengüeta ha recorrido `delay` (0–1) y termina a la vez que ella.
 * Así una sola lengüeta mueve varias piezas, unas detrás de otras, como en
 * los libros de Meggendorfer.
 */
export function linkedProgress(progress: number, delay: number): number {
  const d = clamp(delay, 0, 0.95)
  return clamp((progress - d) / (1 - d))
}

/**
 * Contorno de una ventana en forma de sector circular (para la tapa de una
 * rueda): centro en el origen, radios `inner` y `outer`, entre los ángulos
 * `from` y `to` (radianes).
 */
export function sectorOutline(
  inner: number,
  outer: number,
  from: number,
  to: number,
  steps = 16,
): [number, number][] {
  const points: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps
    points.push([Math.cos(a) * outer, Math.sin(a) * outer])
  }
  for (let i = steps; i >= 0; i--) {
    const a = from + ((to - from) * i) / steps
    points.push([Math.cos(a) * inner, Math.sin(a) * inner])
  }
  return points
}
