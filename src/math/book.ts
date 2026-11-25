import { clamp, easeInOutCubic } from './easing'

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

/** Ángulo de la hoja en radianes, con arranque y frenada suaves. */
export function leafAngle(position: number, leaf: number): number {
  return easeInOutCubic(leafProgress(position, leaf)) * Math.PI
}

export interface Thicknesses {
  cover: number
  page: number
}

/** Grosor de una hoja: la tapa es más gruesa que las páginas. */
export function leafThickness(leaf: number, t: Thicknesses): number {
  return leaf === 0 ? t.cover : t.page
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
  return 0.6 + 0.25 * Math.min(distance, 6)
}
