import { clamp } from './easing'

/**
 * Pliegue en V: dos paneles unidos por un pliegue central. Cada panel va
 * pegado a un soporte a lo largo de una línea que forma un ángulo α con la
 * bisagra, y los tres pliegues salen del mismo punto de la bisagra.
 *
 * Mismo sistema que el pliegue paralelo: bisagra por el eje Z, soporte
 * derecho por +X y soporte izquierdo girado θ hacia +Y.
 */

export type Vec3 = [number, number, number]

export interface VFoldPose {
  /** Dirección de la línea de pegado sobre el soporte derecho. */
  right: Vec3
  /** Dirección de la línea de pegado sobre el soporte izquierdo. */
  left: Vec3
  /** Dirección del pliegue central. */
  crease: Vec3
}

/**
 * Direcciones del pliegue en V para una apertura θ (radianes). `alpha` es
 * el ángulo entre las líneas de pegado y la bisagra; `beta`, el ángulo de
 * la pieza entre su pliegue central y cada línea de pegado. `toward` es
 * hacia dónde van las líneas de pegado desde el vértice: -1 hacia el fondo
 * (Z negativo) y +1 hacia el frente.
 *
 * El pliegue central d cumple d·r = d·l = cos β. Por simetría está en el
 * plano bisector y la ecuación tiene solución cerrada; coincide con la de
 * las tres esferas de Glassner (1998) en este caso.
 */
export function vFold(theta: number, alpha: number, beta: number, toward: 1 | -1 = -1): VFoldPose {
  const sa = Math.sin(alpha)
  const ca = Math.cos(alpha)
  const right: Vec3 = [sa, 0, toward * ca]
  const left: Vec3 = [sa * Math.cos(theta), sa * Math.sin(theta), toward * ca]
  const half = theta / 2
  // d = (sin γ cos θ/2, sin γ sin θ/2, ±cos γ) con A sin γ + B cos γ = cos β.
  const A = sa * Math.cos(half)
  const B = ca
  const R = Math.hypot(A, B)
  const gamma = Math.atan2(A, B) + Math.acos(clamp(Math.cos(beta) / R, -1, 1))
  const crease: Vec3 = [
    Math.sin(gamma) * Math.cos(half),
    Math.sin(gamma) * Math.sin(half),
    toward * Math.cos(gamma),
  ]
  return { right, left, crease }
}

/**
 * Una V solo se levanta si el ángulo de la pieza es al menos el de la
 * línea de pegado (regla del Museo del Papel de Georgia Tech).
 */
export function vFoldRises(alpha: number, beta: number): boolean {
  return beta >= alpha
}

/**
 * Inclinación del pliegue central respecto a la vertical con el libro
 * plano, en radianes: 0 = de pie, positiva = hacia donde van las líneas
 * de pegado.
 */
export function vFoldLean(alpha: number, beta: number): number {
  const gamma = Math.acos(clamp(Math.cos(beta) / Math.cos(alpha), -1, 1))
  return Math.PI / 2 - gamma
}
