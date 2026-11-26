import { clamp } from './easing'

/**
 * Desplazamiento de una capa impresa (en unidades del mundo) para un
 * puntero en [-1, 1]: a la derecha con el puntero a la derecha y hacia el
 * fondo de la página con el puntero arriba. `amount` es el recorrido
 * máximo en x y en z.
 */
export function layerShift([x, y]: [number, number], [ax, az]: [number, number]): [number, number] {
  return [clamp(x, -1, 1) * ax, clamp(y, -1, 1) * az]
}

export interface PrintedRect {
  /** Centro en x (distancia al lomo con signo) y en z (a lo largo del lomo). */
  cx: number
  at: number
  /** Ancho y alto de la imagen. */
  width: number
  height: number
  /** Con la bisagra arriba la imagen se gira un cuarto de vuelta. */
  turned: boolean
}

export interface PrintedStrip {
  /** Distancia al lomo del centro de la tira (para seguir la curva de la hoja). */
  along: number
  /** 4 vértices (x, y, z) tumbados sobre la página. */
  positions: number[]
  /** Coordenadas de textura de esos 4 vértices. */
  uvs: number[]
}

/**
 * Parte una ilustración impresa en tiras paralelas al lomo, para que cada
 * una siga la curva de la hoja al pasarla. La parte de arriba de la imagen
 * queda hacia el fondo (bisagra a la izquierda) o hacia el lomo (bisagra
 * arriba), como en la pantalla.
 */
export function printedStrips(rect: PrintedRect, count: number): PrintedStrip[] {
  const { cx, at, width, height, turned } = rect
  const ex = turned ? height : width
  const ez = turned ? width : height
  const x0 = cx - ex / 2
  const z0 = at - ez / 2
  const z1 = at + ez / 2
  const uv = (x: number, z: number): [number, number] =>
    turned ? [(z1 - z) / ez, (cx + ex / 2 - x) / ex] : [(x - x0) / ex, (z1 - z) / ez]
  const strips: PrintedStrip[] = []
  for (let k = 0; k < count; k++) {
    const a = x0 + (ex * k) / count
    const b = x0 + (ex * (k + 1)) / count
    const corners: [number, number][] = [
      [a, z0],
      [b, z0],
      [b, z1],
      [a, z1],
    ]
    strips.push({
      along: (a + b) / 2,
      positions: corners.flatMap(([x, z]) => [x, 0, z]),
      uvs: corners.flatMap(([x, z]) => uv(x, z)),
    })
  }
  return strips
}
