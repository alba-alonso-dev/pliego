import type { Vec3 } from './v-fold'

/**
 * ¿Cabe la pieza dentro de la página con el libro cerrado? Los puntos van
 * en el sistema del lomo (X desde el lomo hacia el borde, Z a lo largo del
 * lomo) y se comparan con el tamaño de la página `[ancho, alto]`.
 * Devuelve cuánto asoma por fuera (0 si cabe).
 */
export function closedOverflow(points: Vec3[], [width, height]: [number, number]): number {
  let overflow = 0
  for (const [x, , z] of points) {
    overflow = Math.max(overflow, x - width, -x, Math.abs(z) - height / 2)
  }
  return Math.max(0, overflow)
}
