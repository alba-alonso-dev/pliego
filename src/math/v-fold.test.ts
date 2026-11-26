import { describe, expect, it } from 'vitest'
import { vFold, vFoldLean, vFoldRises, vFoldValleys, type Vec3 } from './v-fold'

const dot = (p: Vec3, q: Vec3) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2]
const deg = (d: number) => (d * Math.PI) / 180

describe('vFold', () => {
  const alpha = deg(30)
  const beta = deg(55)

  it('el pliegue central forma el ángulo β con las dos líneas de pegado a cualquier apertura', () => {
    for (let t = 5; t <= 180; t += 25) {
      const { right, left, crease } = vFold(deg(t), alpha, beta)
      expect(dot(crease, right)).toBeCloseTo(Math.cos(beta))
      expect(dot(crease, left)).toBeCloseTo(Math.cos(beta))
      expect(Math.hypot(...crease)).toBeCloseTo(1)
    }
  })

  it('las líneas de pegado van sobre sus páginas', () => {
    const { right, left } = vFold(deg(120), alpha, beta)
    expect(right[1]).toBe(0)
    // La izquierda está en el plano girado 120°: perpendicular a su normal.
    expect(dot(left, [-Math.sin(deg(120)), Math.cos(deg(120)), 0])).toBeCloseTo(0)
  })

  it('con el libro cerrado la pieza queda plana', () => {
    const { crease } = vFold(0, alpha, beta)
    expect(crease[1]).toBeCloseTo(0)
  })

  it('con el libro plano el pliegue central sube por el plano medio', () => {
    const { crease } = vFold(Math.PI, alpha, beta)
    expect(crease[0]).toBeCloseTo(0)
    expect(crease[1]).toBeGreaterThan(0.5)
  })

  it('con β = 90° queda de pie con el libro plano', () => {
    const { crease } = vFold(Math.PI, alpha, deg(90))
    expect(crease[1]).toBeCloseTo(1)
  })

  it('si β < α no llega a levantarse', () => {
    expect(vFoldRises(alpha, deg(20))).toBe(false)
    expect(vFoldRises(alpha, beta)).toBe(true)
    const { crease } = vFold(Math.PI, alpha, deg(20))
    expect(crease[1]).toBeCloseTo(0)
  })
})

describe('vFoldLean', () => {
  it('de pie con β = 90° e inclinada hacia las líneas de pegado si β es menor', () => {
    expect(vFoldLean(deg(30), deg(90))).toBeCloseTo(0)
    expect(vFoldLean(deg(30), deg(55))).toBeGreaterThan(0)
  })
})

describe('vFoldValleys', () => {
  const alpha = deg(30)
  const beta = deg(70)
  const angle = (p: Vec3, q: Vec3) => Math.acos(Math.min(1, Math.max(-1, dot(p, q))))

  it('el valle se abre al abrir el libro y queda cerrado con el libro cerrado', () => {
    const closed = vFoldValleys(vFold(0.001, alpha, beta), 0.001, 0.3)
    const open = vFoldValleys(vFold(Math.PI, alpha, beta), Math.PI, 0.3)
    expect(angle(closed.right.right, closed.right.left)).toBeLessThan(0.05)
    expect(angle(open.right.right, open.right.left)).toBeLessThan(Math.PI - 0.1)
    expect(angle(open.right.right, open.right.left)).toBeGreaterThan(0.1)
  })

  it('los dos valles son simétricos con el libro plano', () => {
    const { right, left } = vFoldValleys(vFold(Math.PI, alpha, beta), Math.PI, 0.3)
    expect(angle(right.right, right.left)).toBeCloseTo(angle(left.right, left.left))
  })

  it('los soportes del valle salen perpendiculares a la línea de pegado', () => {
    const pose = vFold(deg(140), alpha, beta)
    const { right } = vFoldValleys(pose, deg(140), 0.3)
    expect(dot(right.right, pose.right)).toBeCloseTo(0)
    expect(dot(right.left, pose.right)).toBeCloseTo(0)
  })
})
