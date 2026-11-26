import { clamp } from './easing'

/**
 * Geometría de los mecanismos de papel, vistos en su «pliegue soporte».
 *
 * Un pliegue soporte es como un libro: dos planos unidos por una bisagra.
 * Se mide en un plano perpendicular a la bisagra (que va por el eje Z):
 * el soporte derecho va por +X y el izquierdo forma un ángulo θ (en
 * radianes) con él, girando hacia +Y. Con θ = π el «libro» está plano; con
 * θ = 0, cerrado. Para un spread, el soporte derecho es la página derecha.
 */

export type Vec2 = [number, number]

/** Dirección del soporte izquierdo para una apertura θ. */
export function leftSupport(theta: number): Vec2 {
  return [Math.cos(theta), Math.sin(theta)]
}

/** Dirección de la bisectriz: hacia dónde «sale» el mecanismo. */
export function bisector(theta: number): Vec2 {
  return [Math.cos(theta / 2), Math.sin(theta / 2)]
}

/**
 * Punto a distancia `r1` de `c1` y `r2` de `c2`. De las dos soluciones se
 * queda con la que más avanza en la dirección `toward`. Si las
 * circunferencias no se cortan, da el punto más cercano a hacerlo.
 */
export function circleIntersection(c1: Vec2, r1: number, c2: Vec2, r2: number, toward: Vec2): Vec2 {
  const dx = c2[0] - c1[0]
  const dy = c2[1] - c1[1]
  const d = Math.hypot(dx, dy)
  if (d < 1e-12) return [c1[0] + toward[0] * r1, c1[1] + toward[1] * r1]
  const ux = dx / d
  const uy = dy / d
  // Distancia desde c1, sobre la recta de centros, al pie de las soluciones.
  const a = clamp((r1 * r1 - r2 * r2 + d * d) / (2 * d), -r1, r1)
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a))
  const bx = c1[0] + a * ux
  const by = c1[1] + a * uy
  const s = -uy * toward[0] + ux * toward[1] >= 0 ? 1 : -1
  return [bx - s * h * uy, by + s * h * ux]
}

export interface ParallelFoldSpec {
  /** Distancia del pegado izquierdo al lomo. */
  a: number
  /** Distancia del pegado derecho al lomo. */
  b: number
  /** Largo del panel izquierdo (del pegado al pliegue). */
  left: number
  /** Largo del panel derecho. */
  right: number
}

export interface ParallelFoldPose {
  /** Pegado sobre el soporte izquierdo. */
  A: Vec2
  /** Pegado sobre el soporte derecho. */
  B: Vec2
  /** Pliegue de la pieza, donde se juntan los dos paneles. */
  C: Vec2
}

/**
 * Pliegue paralelo: un cuadrilátero articulado lomo-A-C-B. Los pliegues
 * de la pieza son paralelos al lomo, así que basta con resolverlo en el
 * plano. C está a `left` de A y a `right` de B, del lado de la bisectriz.
 */
export function parallelFold(theta: number, spec: ParallelFoldSpec): ParallelFoldPose {
  const [lx, ly] = leftSupport(theta)
  const A: Vec2 = [spec.a * lx, spec.a * ly]
  const B: Vec2 = [spec.b, 0]
  const C = circleIntersection(A, spec.left, B, spec.right, bisector(theta))
  return { A, B, C }
}

/**
 * ¿Se pliega del todo al cerrar? Un cuadrilátero de lados a, b, c y d, en
 * ese orden, queda plano si a + b = c + d (Hara y Sugihara, 2009): aquí,
 * distancia al lomo más largo del panel igual a los dos lados.
 */
export function isFoldable(spec: ParallelFoldSpec, tolerance = 1e-6): boolean {
  return Math.abs(spec.a + spec.left - (spec.b + spec.right)) <= tolerance
}

/** Escalón: los paneles quedan paralelos a las páginas (completo a 90°). */
export function stepFold(a: number, b: number): ParallelFoldSpec {
  return { a, b, left: b, right: a }
}

/** Tienda simétrica: dos paneles iguales que se juntan en una cumbrera. */
export function tentFold(distance: number, panel: number): ParallelFoldSpec {
  return { a: distance, b: distance, left: panel, right: panel }
}
