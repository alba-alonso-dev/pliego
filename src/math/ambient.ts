/**
 * Pequeñas animaciones de ambiente: girar, balancearse y flotar. Son
 * funciones del tiempo (segundos), así que se pueden probar y repetir.
 */

/** Ángulo de un giro continuo (radianes) a `speed` vueltas por segundo. */
export function spinAngle(time: number, speed: number): number {
  return time * speed * Math.PI * 2
}

/** Balanceo: oscila entre ±`amplitude` radianes con un periodo en segundos. */
export function swayAngle(time: number, amplitude: number, period: number, phase = 0): number {
  return Math.sin(((time + phase) / period) * Math.PI * 2) * amplitude
}

/** Flotar: sube y baja ±`amplitude` con un periodo en segundos. */
export function bobOffset(time: number, amplitude: number, period: number, phase = 0): number {
  return Math.sin(((time + phase) / period) * Math.PI * 2) * amplitude
}
