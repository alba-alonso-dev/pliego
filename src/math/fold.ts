import { clamp, easeInOutCubic } from './easing'

/**
 * Matemática del pop-up.
 *
 * θ (theta) es el ángulo de apertura del spread, en grados: 0 cerrado y
 * 180 plano. Cada pieza pop-up tiene una elevación φ (phi), también en
 * grados: 0 tumbada sobre la página y `angle` de pie.
 *
 * Como en un pop-up de papel, la pieza se levanta a medida que el libro se
 * abre. Con un retardo, unas piezas esperan a que el spread esté más
 * abierto antes de empezar a subir: así se levantan por capas.
 */

/** Retardo máximo por profundidad: las piezas del frente esperan hasta el 35 % de la apertura. */
export const MAX_DEPTH_DELAY = 0.35

/**
 * Fracción (0–1) del despliegue de una pieza para una apertura θ, con un
 * retardo `delay` (0–1): la pieza no empieza a subir hasta θ/180 = delay.
 */
export function unfoldProgress(theta: number, delay = 0): number {
  const opened = clamp(theta / 180)
  const d = clamp(delay, 0, 0.95)
  return clamp((opened - d) / (1 - d))
}

/**
 * Sesgo de la curva de despliegue (> 1): con la hoja a 90° las piezas ya
 * están casi tumbadas, como en un pop-up de papel, en vez de sobresalir
 * de la página que gira.
 */
export const FOLD_BIAS = 2

/** Elevación φ en grados: φ = angle · ease(progreso ^ FOLD_BIAS). */
export function elevation(theta: number, angle = 90, delay = 0): number {
  return angle * easeInOutCubic(unfoldProgress(theta, delay) ** FOLD_BIAS)
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
