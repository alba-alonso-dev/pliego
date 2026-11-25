import { clamp } from './easing'

/**
 * Matemática del pop-up.
 *
 * θ (theta) es el ángulo de apertura del spread, en grados: 0 cerrado y
 * 180 plano. Cada pieza pop-up tiene una elevación φ (phi), también en
 * grados: 0 tumbada sobre la página y `angle` de pie.
 *
 * Como en un pop-up de papel, la pieza se levanta a la vez que el libro se
 * abre, desde el primer grado: aparece y desaparece con el paso de la hoja,
 * sin esperar tumbada. Las piezas con retardo suben algo más despacio al
 * principio y alcanzan a las demás al final, así se levantan por capas.
 */

/** Retardo máximo por profundidad (las piezas del frente). */
export const MAX_DEPTH_DELAY = 0.2

/**
 * Sesgo de la curva de despliegue (≥ 1): las piezas van un poco por detrás
 * de la apertura para no sobresalir de la hoja que gira.
 */
export const FOLD_BIAS = 1.3

/**
 * Fracción (0–1) del despliegue de una pieza para una apertura θ. El
 * retardo `delay` (0–1) no la deja quieta: solo hace la curva más tardía,
 * de modo que sigue moviéndose con la hoja y termina igual de pie.
 */
export function unfoldProgress(theta: number, delay = 0): number {
  const opened = clamp(theta / 180)
  return opened ** (FOLD_BIAS * (1 + 2 * clamp(delay)))
}

/** Elevación φ en grados: φ = angle · progreso. */
export function elevation(theta: number, angle = 90, delay = 0): number {
  return angle * unfoldProgress(theta, delay)
}

/**
 * Retardo según la profundidad de la línea de pliegue: las piezas del fondo
 * (z negativo, lejos del lector) se levantan antes que las del frente.
 * `z` va de -alto/2 (fondo) a +alto/2 (frente).
 */
export function depthDelay(z: number, pageHeight: number, max = MAX_DEPTH_DELAY): number {
  return clamp((z + pageHeight / 2) / pageHeight) * max
}

/**
 * Rotación en X (radianes) del pivote de una pieza: 0 de pie y -π/2
 * tumbada hacia el fondo, que es como se pliega un pop-up al cerrar.
 */
export function pivotRotationX(phi: number): number {
  return -((90 - phi) * Math.PI) / 180
}
