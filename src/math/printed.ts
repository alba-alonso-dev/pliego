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
