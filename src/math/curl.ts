import { clamp } from './easing'

/**
 * Curvatura de una hoja al pasarla: el borde libre se queda un poco atrás
 * respecto al lomo, como el papel de verdad. La hoja se describe por el
 * ángulo de su línea central a lo largo del ancho: φ(u) = -bend · (u/L)²,
 * casi recta junto al lomo y más curvada hacia el borde.
 */

/** Curvatura máxima (radianes de retraso del borde) a mitad del giro. */
export const MAX_CURL = 0.45

/** Cuánto se curva la hoja según lo que lleva girado (0–1): nada al principio ni al final. */
export function curlAmount(progress: number, max = MAX_CURL): number {
  return Math.sin(Math.PI * clamp(progress)) * max
}

/**
 * Puntos de la línea central de la hoja curvada, en `columns` posiciones
 * repartidas a lo largo del ancho `length`, empezando en `start` (la
 * holgura del lomo). Devuelve para cada columna el punto (x, y) y el
 * ángulo de la hoja en ese punto.
 */
export function curlColumns(
  bend: number,
  length: number,
  columns: number,
  start = 0,
): { x: number; y: number; angle: number }[] {
  const out: { x: number; y: number; angle: number }[] = []
  let x = start
  let y = 0
  const step = length / (columns - 1)
  for (let i = 0; i < columns; i++) {
    const u = i * step
    const angle = -bend * (u / length) ** 2
    if (i > 0) {
      // Integra con el ángulo en el punto medio del tramo.
      const mid = -bend * ((u - step / 2) / length) ** 2
      x += Math.cos(mid) * step
      y += Math.sin(mid) * step
    }
    out.push({ x, y, angle })
  }
  return out
}
