import { describe, expect, it } from 'vitest'
import type { Point } from '../paper/outline'
import { hashSeed, roughenContour, seededRandom, subdivide } from './rough-edges'

const square: Point[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
]

/** Estrella de 5 puntas: tiene esquinas cóncavas muy cerradas. */
const star: Point[] = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 0.5 : 0.2
  const a = (i / 10) * Math.PI * 2
  return [Math.cos(a) * r, Math.sin(a) * r]
})

function segmentsCross(a: Point, b: Point, c: Point, d: Point): boolean {
  const cross = (p: Point, q: Point, r: Point) =>
    (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
  const d1 = cross(c, d, a)
  const d2 = cross(c, d, b)
  const d3 = cross(a, b, c)
  const d4 = cross(a, b, d)
  return d1 * d2 < 0 && d3 * d4 < 0
}

function selfIntersects(points: Point[]): boolean {
  const n = points.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue
      if (segmentsCross(points[i]!, points[(i + 1) % n]!, points[j]!, points[(j + 1) % n]!)) {
        return true
      }
    }
  }
  return false
}

function longestGap(points: Point[]): number {
  return Math.max(
    ...points.map((p, i) => {
      const q = points[(i + 1) % points.length]!
      return Math.hypot(q[0] - p[0], q[1] - p[1])
    }),
  )
}

describe('seededRandom', () => {
  it('repite la misma secuencia con la misma semilla', () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('da valores en [0, 1)', () => {
    const random = seededRandom(7)
    for (let i = 0; i < 1000; i++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('hashSeed', () => {
  it('es estable y distingue textos', () => {
    expect(hashSeed('casa')).toBe(hashSeed('casa'))
    expect(hashSeed('casa')).not.toBe(hashSeed('arbol'))
  })
})

describe('subdivide', () => {
  it('ningún tramo supera el paso pedido', () => {
    expect(longestGap(subdivide(square, 0.1))).toBeLessThanOrEqual(0.1 + 1e-9)
  })
})

describe('roughenContour', () => {
  const options = { amount: 0.01, seed: 3 }

  it('es determinista con la misma semilla', () => {
    expect(roughenContour(square, options)).toEqual(roughenContour(square, options))
  })

  it('cambia con otra semilla', () => {
    expect(roughenContour(square, options)).not.toEqual(
      roughenContour(square, { ...options, seed: 4 }),
    )
  })

  it('no se aleja del contorno original más de lo pedido', () => {
    const dense = subdivide(square, options.amount * 4)
    const rough = roughenContour(square, options)
    rough.forEach((p, i) => {
      const q = dense[i]!
      expect(Math.hypot(p[0] - q[0], p[1] - q[1])).toBeLessThanOrEqual(options.amount + 1e-9)
    })
  })

  it('no deja huecos: los puntos siguen igual de juntos', () => {
    const rough = roughenContour(square, options)
    expect(longestGap(rough)).toBeLessThan(options.amount * 4 * 1.7)
  })

  it.each([
    ['cuadrado', square],
    ['estrella cóncava', star],
  ])('no se cruza consigo mismo (%s)', (_name, shape) => {
    for (const seed of [1, 2, 3, 4, 5]) {
      expect(selfIntersects(roughenContour(shape, { amount: 0.02, seed }))).toBe(false)
    }
  })

  it('no toca contornos degenerados o sin rugosidad', () => {
    expect(roughenContour(square, { amount: 0 })).toBe(square)
    const line: Point[] = [
      [0, 0],
      [1, 0],
    ]
    expect(roughenContour(line, { amount: 0.1 })).toBe(line)
  })
})
