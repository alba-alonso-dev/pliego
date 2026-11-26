import { describe, expect, it } from 'vitest'
import { bobOffset, spinAngle, swayAngle } from './ambient'

describe('animaciones de ambiente', () => {
  it('el giro da una vuelta por segundo a velocidad 1', () => {
    expect(spinAngle(1, 1)).toBeCloseTo(Math.PI * 2)
    expect(spinAngle(0.5, 0.5)).toBeCloseTo(Math.PI / 2)
  })

  it('el balanceo no pasa de su amplitud y se repite con su periodo', () => {
    for (let t = 0; t < 4; t += 0.1) {
      expect(Math.abs(swayAngle(t, 0.2, 2))).toBeLessThanOrEqual(0.2 + 1e-9)
    }
    expect(swayAngle(0.3, 0.2, 2)).toBeCloseTo(swayAngle(2.3, 0.2, 2))
  })

  it('flotar sube y baja alrededor de su sitio', () => {
    expect(bobOffset(0, 0.01, 3)).toBeCloseTo(0)
    expect(bobOffset(0.75, 0.01, 3)).toBeCloseTo(0.01)
  })
})
