/** Limita `value` al intervalo [min, max]. */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

/** Interpolación lineal entre `a` y `b`. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Arranque y frenada suaves (curva cúbica). Entrada y salida en [0, 1]. */
export function easeInOutCubic(t: number): number {
  const x = clamp(t)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

/**
 * Arranque y frenada suaves con forma de seno: más gradual que la cúbica,
 * sin acelerón a mitad de camino. Entrada y salida en [0, 1].
 */
export function easeInOutSine(t: number): number {
  return 0.5 - Math.cos(Math.PI * clamp(t)) / 2
}

/** Frenada suave al final, como un papel que se asienta. */
export function easeOutCubic(t: number): number {
  const x = clamp(t)
  return 1 - (1 - x) ** 3
}
