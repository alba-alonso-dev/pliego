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

/**
 * Cuánto alejar la cámara para que quepa un ancho `width` (unidades del
 * mundo) a la distancia `distance`, con un campo de visión vertical `fov`
 * (grados) y una proporción de pantalla `aspect`. 1 = no hace falta.
 */
export function fitDistanceFactor(
  width: number,
  distance: number,
  fov: number,
  aspect: number,
): number {
  const visible = 2 * distance * Math.tan((fov * Math.PI) / 360) * aspect
  return visible <= 0 ? 1 : Math.max(1, width / visible)
}

/**
 * Cuánto alejar la cámara para que quepa el libro abierto entero: su ancho
 * `width` en horizontal y su fondo `depth` en vertical, visto desde una
 * cámara que mira hacia abajo con un ángulo `elevation` (radianes) sobre
 * la mesa. 1 = cabe sin alejarla. Deja un 10 % de margen.
 */
export function fitBookFactor(
  [width, depth]: [number, number],
  distance: number,
  fov: number,
  aspect: number,
  elevation: number,
): number {
  const margin = 1.1
  // El ancho tiene que caber en el borde de delante del libro, que está más
  // cerca de la cámara que el centro y se ve más grande.
  const halfFov = Math.tan((fov * Math.PI) / 360)
  const nearOffset = (depth / 2) * Math.cos(elevation)
  const needed = (width * margin) / (2 * halfFov * aspect) + nearOffset
  const byWidth = distance <= 0 || aspect <= 0 ? 1 : Math.max(1, needed / distance)
  // En pantalla, el fondo del libro se ve acortado por la inclinación.
  const visibleDepth = depth * Math.sin(elevation) * margin
  const byDepth = fitDistanceFactor(visibleDepth, distance, fov, 1)
  return Math.max(byWidth, byDepth)
}
