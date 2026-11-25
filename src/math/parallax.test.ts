import { describe, expect, it } from 'vitest'
import { damping, parallaxOffset, REST_BETA, TILT_RANGE, tiltToPointer } from './parallax'

describe('tiltToPointer', () => {
  it('el móvil en reposo equivale al puntero en el centro', () => {
    const [x, y] = tiltToPointer(REST_BETA, 0)
    expect(x).toBe(0)
    expect(y).toBeCloseTo(0)
  })

  it('inclinar a la derecha mueve el puntero a la derecha, con tope', () => {
    expect(tiltToPointer(REST_BETA, TILT_RANGE)[0]).toBe(1)
    expect(tiltToPointer(REST_BETA, 90)[0]).toBe(1)
    expect(tiltToPointer(REST_BETA, -90)[0]).toBe(-1)
  })
})

describe('parallaxOffset', () => {
  it('el vertical recorre la mitad que el horizontal', () => {
    expect(parallaxOffset(1, 1, 0.2)).toEqual([0.2, 0.1])
  })

  it('limita punteros fuera de rango', () => {
    expect(parallaxOffset(5, -5, 0.2)).toEqual([0.2, -0.1])
  })
})

describe('damping', () => {
  it('no se mueve sin tiempo y se acerca más cuanto más tiempo pasa', () => {
    expect(damping(4, 0)).toBe(0)
    expect(damping(4, 1 / 30)).toBeGreaterThan(damping(4, 1 / 60))
    expect(damping(4, 10)).toBeCloseTo(1)
  })
})
