import { describe, expect, it } from 'vitest'
import { curledPoint, pageCurl } from './page-curl'

describe('pageCurl', () => {
  it('la tapa y la contratapa no se curvan', () => {
    expect(pageCurl(0.5, 0, 'left', 4).bend).toBe(0)
    expect(pageCurl(3.5, 3, 'right', 4).bend).toBe(0)
  })

  it('una hoja a mitad de giro se curva; con movimiento reducido, no', () => {
    expect(pageCurl(1.5, 0, 'right', 4).bend).toBeGreaterThan(0)
    expect(pageCurl(1.5, 0, 'right', 4, true).bend).toBe(0)
  })

  it('en la página izquierda el marco va girado media vuelta', () => {
    expect(pageCurl(1.5, 1, 'left', 4).sign).toBe(-1)
  })
})

describe('curledPoint', () => {
  it('sin curvatura el punto se queda donde estaba', () => {
    const [x, y] = curledPoint(0.6, { bend: 0, sign: 1 }, 1, 0)
    expect(x).toBeCloseTo(0.6)
    expect(y).toBeCloseTo(0)
  })

  it('curvada, el borde se queda atrás en los dos lados', () => {
    const [, yRight] = curledPoint(0.9, { bend: 0.4, sign: 1 }, 1, 0)
    const [xLeft, yLeft] = curledPoint(-0.9, { bend: 0.4, sign: -1 }, 1, 0)
    expect(yRight).toBeLessThan(0)
    expect(yLeft).toBeGreaterThan(0)
    expect(xLeft).toBeLessThan(0)
  })
})
