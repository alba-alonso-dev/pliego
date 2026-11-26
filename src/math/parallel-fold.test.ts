import { describe, expect, it } from 'vitest'
import {
  circleIntersection,
  isFoldable,
  parallelFold,
  stepFold,
  tentFold,
  type Vec2,
} from './parallel-fold'

const dist = (p: Vec2, q: Vec2) => Math.hypot(p[0] - q[0], p[1] - q[1])

describe('circleIntersection', () => {
  it('da el punto a la distancia pedida de los dos centros, del lado elegido', () => {
    const p = circleIntersection([0, 0], 5, [6, 0], 5, [0, 1])
    expect(p[0]).toBeCloseTo(3)
    expect(p[1]).toBeCloseTo(4)
    const q = circleIntersection([0, 0], 5, [6, 0], 5, [0, -1])
    expect(q[1]).toBeCloseTo(-4)
  })

  it('si no se cortan, da el punto más cercano en la recta de centros', () => {
    const p = circleIntersection([0, 0], 1, [10, 0], 1, [0, 1])
    expect(p[1]).toBeCloseTo(0)
  })
})

describe('parallelFold', () => {
  it('el escalón forma un paralelogramo: completo a 90° y plano a 180°', () => {
    const spec = stepFold(0.2, 0.3)
    const open90 = parallelFold(Math.PI / 2, spec)
    expect(open90.C[0]).toBeCloseTo(0.3)
    expect(open90.C[1]).toBeCloseTo(0.2)
    const flat = parallelFold(Math.PI, spec)
    expect(flat.C[1]).toBeCloseTo(0)
  })

  it('la tienda queda de pie con el libro abierto del todo', () => {
    const { C } = parallelFold(Math.PI, tentFold(0.2, 0.25))
    expect(C[0]).toBeCloseTo(0)
    expect(C[1]).toBeCloseTo(0.15)
  })

  it('con el libro cerrado todo queda plano sobre la página', () => {
    for (const spec of [stepFold(0.2, 0.3), tentFold(0.2, 0.25)]) {
      const { A, B, C } = parallelFold(0, spec)
      expect(A[1]).toBeCloseTo(0)
      expect(B[1]).toBeCloseTo(0)
      expect(C[1]).toBeCloseTo(0, 4)
    }
  })

  it('los paneles conservan su largo a cualquier apertura', () => {
    const spec = tentFold(0.2, 0.25)
    for (let deg = 5; deg <= 180; deg += 25) {
      const { A, B, C } = parallelFold((deg * Math.PI) / 180, spec)
      expect(dist(A, C)).toBeCloseTo(0.25)
      expect(dist(B, C)).toBeCloseTo(0.25)
    }
  })
})

describe('isFoldable', () => {
  it('distancia al lomo más panel debe sumar lo mismo a los dos lados', () => {
    expect(isFoldable(stepFold(0.2, 0.3))).toBe(true)
    expect(isFoldable(tentFold(0.2, 0.25))).toBe(true)
    expect(isFoldable({ a: 0.2, b: 0.2, left: 0.3, right: 0.2 })).toBe(false)
  })
})
