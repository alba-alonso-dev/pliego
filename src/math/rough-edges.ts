import type { Outline, Point } from '../paper/outline'

/** Generador pseudoaleatorio con semilla (mulberry32): mismo resultado en cada carga. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Semilla estable a partir de un texto (por ejemplo, el SVG de la pieza). */
export function hashSeed(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Ruido 1D suave y periódico: interpola valores aleatorios repartidos a lo
 * largo del contorno, para que el borde ondule en vez de dentarse.
 */
function periodicNoise(random: () => number, knots: number): (t: number) => number {
  const values = Array.from({ length: knots }, () => random() * 2 - 1)
  return (t: number) => {
    const x = (((t % 1) + 1) % 1) * knots
    const i = Math.floor(x)
    const f = x - i
    const a = values[i % knots]!
    const b = values[(i + 1) % knots]!
    const s = f * f * (3 - 2 * f)
    return a + (b - a) * s
  }
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1])
}

/** Inserta puntos para que ningún tramo mida más que `step`. */
export function subdivide(points: Point[], step: number): Point[] {
  const out: Point[] = []
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!
    const b = points[(i + 1) % points.length]!
    const n = Math.max(1, Math.ceil(distance(a, b) / step))
    for (let k = 0; k < n; k++) {
      const t = k / n
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
  }
  return out
}

export interface RoughOptions {
  /** Desplazamiento máximo del borde, en unidades del mundo. */
  amount: number
  /** Distancia entre puntos del contorno resultante. */
  step?: number
  /** Ondulaciones por unidad de perímetro. */
  frequency?: number
  seed?: number
}

/**
 * Desplaza cada punto del contorno a lo largo de su normal con un ruido
 * suave. El desplazamiento se limita a una fracción del tramo más cercano
 * para que los bordes no se crucen ni en las esquinas cóncavas.
 */
export function roughenContour(points: Point[], options: RoughOptions): Point[] {
  const { amount, step = amount * 4, frequency = 40, seed = 1 } = options
  if (amount <= 0 || points.length < 3) return points
  const dense = subdivide(points, step)
  const n = dense.length
  const lengths = dense.map((p, i) => distance(p, dense[(i + 1) % n]!))
  const perimeter = lengths.reduce((a, b) => a + b, 0)
  const noise = periodicNoise(seededRandom(seed), Math.max(3, Math.round(perimeter * frequency)))

  const out: Point[] = []
  let travelled = 0
  for (let i = 0; i < n; i++) {
    const prev = dense[(i - 1 + n) % n]!
    const current = dense[i]!
    const next = dense[(i + 1) % n]!
    // Normal media de los dos tramos que se unen en este punto.
    let nx = next[1] - prev[1]
    let ny = prev[0] - next[0]
    const length = Math.hypot(nx, ny) || 1
    nx /= length
    ny /= length
    const room = 0.3 * Math.min(lengths[i]!, lengths[(i - 1 + n) % n]!)
    const offset = Math.max(-room, Math.min(room, noise(travelled / perimeter) * amount))
    out.push([current[0] + nx * offset, current[1] + ny * offset])
    travelled += lengths[i]!
  }
  return out
}

/** Aplica `roughenContour` al contorno y a los agujeros de cada pieza. */
export function roughenOutlines(outlines: Outline[], options: RoughOptions): Outline[] {
  const seed = options.seed ?? 1
  return outlines.map(({ contour, holes }, i) => ({
    contour: roughenContour(contour, { ...options, seed: seed + i * 7919 }),
    holes: holes.map((hole, j) =>
      roughenContour(hole, { ...options, seed: seed + i * 7919 + (j + 1) * 104729 }),
    ),
  }))
}
