import { clamp } from './easing'

/** Inclinación del móvil (en grados) que equivale a llevar el ratón al borde. */
export const TILT_RANGE = 25
/** Inclinación hacia delante que se considera «en reposo» al sujetar el móvil. */
export const REST_BETA = 40

/**
 * Convierte la orientación del dispositivo (DeviceOrientationEvent) en una
 * posición de puntero entre -1 y 1, como la del ratón.
 * `gamma` es la inclinación izquierda/derecha y `beta`, adelante/atrás.
 */
export function tiltToPointer(beta: number, gamma: number): [number, number] {
  return [clamp(gamma / TILT_RANGE, -1, 1), clamp(-(beta - REST_BETA) / TILT_RANGE, -1, 1)]
}

/**
 * Desplazamiento de la cámara para un puntero en [-1, 1]: se mueve en
 * horizontal y, con la mitad de recorrido, en vertical.
 */
export function parallaxOffset(x: number, y: number, amount: number): [number, number] {
  return [clamp(x, -1, 1) * amount, clamp(y, -1, 1) * amount * 0.5]
}

/**
 * Suavizado independiente de los fotogramas por segundo: cuánto acercarse
 * al objetivo en este fotograma (0–1).
 */
export function damping(lambda: number, delta: number): number {
  return 1 - Math.exp(-lambda * delta)
}
