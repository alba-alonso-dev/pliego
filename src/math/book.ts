import { clamp, easeInOutSine } from './easing'

/**
 * Modelo físico del libro.
 *
 * Con `count` spreads hay `count` hojas que giran: la tapa (hoja 0) y
 * `count - 1` hojas interiores. La contratapa no gira: es la base.
 *
 * `position` es un número continuo entre 0 y `count`:
 * - 0 → libro cerrado, se ve la tapa.
 * - n → se han pasado n hojas y está abierto el spread n - 1.
 * Los valores intermedios son hojas a medio girar.
 */

/** Cuánto ha girado la hoja `leaf` (0 = a la derecha, 1 = a la izquierda). */
export function leafProgress(position: number, leaf: number): number {
  return clamp(position - leaf)
}

/**
 * Ángulo de la hoja en radianes, con arranque y frenada suaves. La curva
 * de seno evita que la hoja dé un acelerón a mitad del giro.
 */
export function leafAngle(position: number, leaf: number): number {
  return easeInOutSine(leafProgress(position, leaf)) * Math.PI
}

export interface Thicknesses {
  cover: number
  page: number
  /**
   * Grosor propio de algunas hojas, por índice (como las capas de roca de
   * Estratos). Si falta, la hoja usa `page`.
   */
  pages?: (number | undefined)[]
}

/** Grosor de una hoja: la tapa es más gruesa; cada hoja puede tener el suyo. */
export function leafThickness(leaf: number, t: Thicknesses): number {
  if (leaf === 0) return t.cover
  return t.pages?.[leaf] ?? t.page
}

function sumThickness(from: number, to: number, t: Thicknesses): number {
  let total = 0
  for (let k = from; k < to; k++) total += leafThickness(k, t)
  return total
}

/**
 * Altura del centro de la hoja `leaf` cuando está a la derecha, sin pasar.
 * Debajo están la contratapa y las hojas con índice mayor.
 */
export function rightStackY(leaf: number, count: number, t: Thicknesses): number {
  return t.cover + sumThickness(leaf + 1, count, t) + leafThickness(leaf, t) / 2
}

/**
 * Altura del centro de la hoja `leaf` cuando ya está pasada, a la izquierda.
 * Debajo están las hojas que se pasaron antes.
 */
export function leftStackY(leaf: number, t: Thicknesses): number {
  return sumThickness(0, leaf, t) + leafThickness(leaf, t) / 2
}

/** Cuánto se eleva una hoja a mitad de giro para no rozar las demás. */
export const TURN_LIFT = 0.02

export interface LeafPose {
  /** Giro sobre el lomo en radianes: 0 a la derecha, π a la izquierda. */
  angle: number
  /** Altura del centro de la hoja. */
  y: number
  /** Grosor de la hoja. */
  thickness: number
}

/** Dónde está la hoja `leaf` para una posición del libro. */
export function leafPose(position: number, leaf: number, count: number, t: Thicknesses): LeafPose {
  const progress = leafProgress(position, leaf)
  const y =
    rightStackY(leaf, count, t) +
    (leftStackY(leaf, t) - rightStackY(leaf, count, t)) * progress +
    Math.sin(progress * Math.PI) * TURN_LIFT
  return { angle: leafAngle(position, leaf), y, thickness: leafThickness(leaf, t) }
}

export interface PageFrame {
  /** Giro del marco de la página sobre el lomo (0 = plana en su lado). */
  rotation: number
  /** Altura del lomo para el marco. */
  y: number
  /** Distancia del eje del marco a la superficie de la página. */
  surface: number
}

/**
 * Marco de referencia de una de las dos páginas del spread `spread`: las
 * piezas pop-up se pegan a él para girar con su página al pasar la hoja.
 * La página izquierda es la hoja `spread`; la derecha, la hoja `spread + 1`
 * o la contratapa en el último spread.
 */
export function pageFrame(
  position: number,
  spread: number,
  side: 'left' | 'right',
  count: number,
  t: Thicknesses,
): PageFrame {
  if (side === 'left') {
    const pose = leafPose(position, spread, count, t)
    return { rotation: pose.angle - Math.PI, y: pose.y, surface: pose.thickness / 2 }
  }
  if (spread + 1 >= count) return { rotation: 0, y: t.cover / 2, surface: t.cover / 2 }
  const pose = leafPose(position, spread + 1, count, t)
  return { rotation: pose.angle, y: pose.y, surface: pose.thickness / 2 }
}

/**
 * Ángulo de apertura del spread `spread` en grados: 0 cerrado, 180 plano.
 * Es el ángulo entre su página izquierda (hoja `spread`) y su página
 * derecha (hoja `spread + 1`, o la contratapa en el último spread).
 */
export function spreadTheta(position: number, spread: number, count: number): number {
  const left = leafAngle(position, spread)
  const right = spread + 1 < count ? leafAngle(position, spread + 1) : 0
  return ((left - right) * 180) / Math.PI
}

/**
 * Altura de la superficie del spread `spread` abierto: la más alta de sus
 * dos páginas, para apoyar encima las piezas de la escena.
 */
export function spreadSurfaceY(spread: number, count: number, t: Thicknesses): number {
  const left = sumThickness(0, spread + 1, t)
  const right = t.cover + sumThickness(spread + 1, count, t)
  return Math.max(left, right)
}

/** Duración en segundos de pasar de una posición a otra. */
export function turnDuration(from: number, to: number): number {
  const distance = Math.abs(to - from)
  if (distance === 0) return 0
  return 0.85 + 0.3 * Math.min(distance, 6)
}
