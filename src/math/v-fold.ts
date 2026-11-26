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

const dot3 = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const unit = (v: Vec3): Vec3 => {
  const length = Math.hypot(...v) || 1
  return [v[0] / length, v[1] / length, v[2] / length]
}

/** Dirección dentro del panel, perpendicular a su línea de pegado, hacia el pliegue central. */
export function panelRise(glue: Vec3, crease: Vec3): Vec3 {
  const k = dot3(crease, glue)
  return unit([crease[0] - k * glue[0], crease[1] - k * glue[1], crease[2] - k * glue[2]])
}

/** Pliegue «valle» en una línea de pegado: entre la página (hacia fuera) y el panel. */
export interface ValleyPose {
  origin: Vec3
  right: Vec3
  left: Vec3
  hinge: Vec3
}

/**
 * Los dos pliegues valle de una V, donde cada panel se junta con su página.
 * Ahí se pueden montar otras piezas (V en cascada). `base` es el largo de
 * las líneas de pegado; el valle se ancla en su punto medio.
 */
export function vFoldValleys(pose: VFoldPose, theta: number, base: number) {
  const pageRight: Vec3 = [1, 0, 0]
  const pageLeft: Vec3 = [Math.cos(theta), Math.sin(theta), 0]
  const normalLeft: Vec3 = [-Math.sin(theta), Math.cos(theta), 0]
  const outward = (glue: Vec3, normal: Vec3, along: Vec3): Vec3 => {
    const p = unit(cross3(glue, normal))
    return dot3(p, along) >= 0 ? p : [-p[0], -p[1], -p[2]]
  }
  const mid = (glue: Vec3): Vec3 => [
    (glue[0] * base) / 2,
    (glue[1] * base) / 2,
    (glue[2] * base) / 2,
  ]
  const right: ValleyPose = {
    origin: mid(pose.right),
    right: outward(pose.right, [0, 1, 0], pageRight),
    left: panelRise(pose.right, pose.crease),
    hinge: pose.right,
  }
  const left: ValleyPose = {
    origin: mid(pose.left),
    right: panelRise(pose.left, pose.crease),
    left: outward(pose.left, normalLeft, pageLeft),
    hinge: [-pose.left[0], -pose.left[1], -pose.left[2]],
  }
  return { right, left }
}
