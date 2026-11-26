import type { Vec3 } from './v-fold'

/**
 * Capas: un mecanismo montado sobre otro usa como «libro» un pliegue de la
 * pieza de abajo. Ese pliegue soporte queda definido por dos direcciones,
 * la de su soporte derecho y la del izquierdo, que salen de la bisagra.
 */
export interface SupportPose {
  /** Punto de la bisagra donde se monta el mecanismo. */
  origin: Vec3
  /** Dirección del soporte derecho (sale de la bisagra). */
  right: Vec3
  /** Dirección del soporte izquierdo. */
  left: Vec3
  /**
   * Dirección de la bisagra si los soportes están casi juntos (pliegue
   * cerrado), cuando no se puede deducir de ellos.
   */
  hinge: Vec3
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const normalize = (v: Vec3): Vec3 => {
  const length = Math.hypot(...v)
  return length < 1e-12 ? v : [v[0] / length, v[1] / length, v[2] / length]
}

export interface SupportFrame {
  /** Apertura del pliegue soporte (radianes, 0–π). */
  theta: number
  /** Ejes del marco: X = soporte derecho, Z = bisagra, Y = Z × X. */
  x: Vec3
  y: Vec3
  z: Vec3
}

/**
 * Marco de un pliegue soporte: X por el soporte derecho, Z por la bisagra
 * orientada para que el izquierdo quede girado +θ hacia Y. Es el mismo
 * sistema que usan todos los mecanismos, así que se pueden anidar.
 */
export function supportFrame(pose: SupportPose): SupportFrame {
  const x = normalize(pose.right)
  const left = normalize(pose.left)
  const theta = Math.acos(Math.min(1, Math.max(-1, dot(x, left))))
  const normal = cross(x, left)
  let z = Math.hypot(...normal) > 1e-6 ? normalize(normal) : normalize(pose.hinge)
  // Que la bisagra no cambie de sentido de golpe cerca del cierre.
  if (dot(z, pose.hinge) < 0 && Math.hypot(...normal) <= 1e-6) z = [-z[0], -z[1], -z[2]]
  // Quita de X cualquier componente a lo largo de la bisagra.
  const y = normalize(cross(z, x))
  return { theta, x: cross(y, z), y, z }
}
