import { describe, expect, it } from 'vitest'
import { floatingLayer } from './floating-layer'
import type { Vec2 } from './parallel-fold'

const dist = (p: Vec2, q: Vec2) => Math.hypot(p[0] - q[0], p[1] - q[1])

describe('floatingLayer', () => {
  it('con el libro plano es un suelo horizontal sobre dos paredes verticales', () => {
    const p = floatingLayer(Math.PI, 0.2, 0.15)
    expect(p.leftCorner[0]).toBeCloseTo(-0.2)
    expect(p.leftCorner[1]).toBeCloseTo(0.15)
    expect(p.rightCorner[0]).toBeCloseTo(0.2)
    expect(p.rightCorner[1]).toBeCloseTo(0.15)
    expect(p.top[1]).toBeCloseTo(0.15)
  })

  it('con el libro cerrado queda todo plano', () => {
    const p = floatingLayer(0, 0.2, 0.15)
    for (const point of [p.top, p.leftCorner, p.rightCorner]) expect(point[1]).toBeCloseTo(0)
  })

  it('paredes y mitades de la tapa no cambian de largo', () => {
    for (let deg = 10; deg <= 180; deg += 30) {
      const p = floatingLayer((deg * Math.PI) / 180, 0.2, 0.15)
      expect(dist(p.leftFoot, p.leftCorner)).toBeCloseTo(0.15)
      expect(dist(p.rightFoot, p.rightCorner)).toBeCloseTo(0.15)
      expect(dist(p.top, p.leftCorner)).toBeCloseTo(0.2)
      expect(dist(p.top, p.rightCorner)).toBeCloseTo(0.2)
    }
  })

  it('cada mitad de la tapa queda paralela a su página', () => {
    const theta = (120 * Math.PI) / 180
    const p = floatingLayer(theta, 0.2, 0.15)
    expect(p.rightCorner[1] - p.top[1]).toBeCloseTo(0)
    const angle = Math.atan2(p.leftCorner[1] - p.top[1], p.leftCorner[0] - p.top[0])
    expect(angle).toBeCloseTo(theta)
  })
})
