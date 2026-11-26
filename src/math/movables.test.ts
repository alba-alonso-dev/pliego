import { describe, expect, it } from 'vitest'
import { linkedProgress, sectorOutline } from './movables'

describe('linkedProgress', () => {
  it('sin retardo sigue a la lengüeta', () => {
    expect(linkedProgress(0.3, 0)).toBeCloseTo(0.3)
  })

  it('con retardo espera y termina a la vez', () => {
    expect(linkedProgress(0.2, 0.4)).toBe(0)
    expect(linkedProgress(0.7, 0.4)).toBeCloseTo(0.5)
    expect(linkedProgress(1, 0.4)).toBe(1)
  })
})

describe('sectorOutline', () => {
  it('da un contorno cerrado entre los dos radios', () => {
    const points = sectorOutline(0.1, 0.3, 0, Math.PI / 2, 4)
    expect(points).toHaveLength(10)
    const radii = points.map(([x, y]) => Math.hypot(x, y))
    expect(Math.min(...radii)).toBeCloseTo(0.1)
    expect(Math.max(...radii)).toBeCloseTo(0.3)
  })
})
