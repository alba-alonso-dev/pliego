import { leafProgress } from './book'
import { curlAmount, curlAt } from './curl'

/**
 * Curvatura de una página del spread en este momento: la hoja a la que
 * pertenece, cuánto se curva y hacia qué lado. La página izquierda es la
 * hoja `spread`; la derecha, la siguiente. La tapa y la contratapa no se
 * curvan.
 */
export interface PageCurl {
  bend: number
  /** -1 en la página izquierda (el marco va girado media vuelta), +1 en la derecha. */
  sign: number
}

export function pageCurl(
  position: number,
  spread: number,
  side: 'left' | 'right',
  count: number,
  reduced = false,
): PageCurl {
  const leaf = side === 'left' ? spread : spread + 1
  const sign = side === 'left' ? -1 : 1
  if (reduced || leaf <= 0 || leaf >= count) return { bend: 0, sign }
  return { bend: curlAmount(leafProgress(position, leaf)), sign }
}

/**
 * Dónde queda un punto de la página a distancia `x` del lomo (con signo)
 * cuando la hoja está curvada: `[x, y, ángulo]` en el marco de la página.
 */
export function curledPoint(
  x: number,
  curl: PageCurl,
  length: number,
  gap: number,
): [number, number, number] {
  const u = Math.abs(x)
  const point = curlAt(curl.bend, length, u - gap, gap)
  return [curl.sign * point.x, curl.sign * point.y, point.angle]
}
