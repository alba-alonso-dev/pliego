import { describe, expect, it } from 'vitest'
import { curlAmount, curlColumns, MAX_CURL } from './curl'

describe('curlAmount', () => {
  it('recta al principio y al final, máxima a mitad del giro', () => {
    expect(curlAmount(0)).toBeCloseTo(0)
    expect(curlAmount(1)).toBeCloseTo(0)
    expect(curlAmount(0.5)).toBeCloseTo(MAX_CURL)
  })
})

describe('curlColumns', () => {
  it('sin curvatura es una línea recta del ancho dado', () => {
    const cols = curlColumns(0, 1, 11, 0.01)
    expect(cols[0]).toEqual({ x: 0.01, y: 0, angle: -0 })
    expect(cols[10]!.x).toBeCloseTo(1.01)
    expect(cols[10]!.y).toBeCloseTo(0)
  })

  it('curvada, el borde se queda atrás y la hoja no cambia de largo', () => {
    const cols = curlColumns(0.5, 1, 41)
    const edge = cols[40]!
    expect(edge.y).toBeLessThan(-0.05)
    expect(edge.angle).toBeCloseTo(-0.5)
    let length = 0
    for (let i = 1; i < cols.length; i++) {
      length += Math.hypot(cols[i]!.x - cols[i - 1]!.x, cols[i]!.y - cols[i - 1]!.y)
    }
    expect(length).toBeCloseTo(1, 2)
  })

  it('junto al lomo apenas se curva', () => {
    const cols = curlColumns(0.5, 1, 41)
    expect(cols[4]!.angle).toBeGreaterThan(-0.01)
  })
})
