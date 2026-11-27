import { describe, expect, it } from 'vitest'
import {
  damping,
  fitBookFactor,
  fitDistanceFactor,
  parallaxOffset,
  REST_BETA,
  TILT_RANGE,
  tiltToPointer,
} from './parallax'

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

describe('fitDistanceFactor', () => {
  it('en pantallas anchas no aleja la cámara', () => {
    expect(fitDistanceFactor(2.2, 3.5, 40, 16 / 9)).toBe(1)
  })

  it('en un móvil en vertical la aleja lo justo para que quepa el libro', () => {
    const factor = fitDistanceFactor(2.2, 3.5, 40, 375 / 812)
    expect(factor).toBeGreaterThan(1)
    const visible = 2 * 3.5 * factor * Math.tan((40 * Math.PI) / 360) * (375 / 812)
    expect(visible).toBeCloseTo(2.2)
  })
})

describe('fitBookFactor', () => {
  const elevation = Math.atan2(2.6, 2.3)

  it('un libro normal cabe sin alejar la cámara en pantalla ancha', () => {
    expect(fitBookFactor([2, 1.4], 3.5, 40, 16 / 9, elevation)).toBe(1)
  })

  it('un libro con la bisagra arriba (muy hondo) aleja la cámara', () => {
    expect(fitBookFactor([1.4, 3.6], 3.5, 40, 16 / 9, elevation)).toBeGreaterThan(1)
  })

  it('en un móvil en vertical manda el ancho', () => {
    expect(fitBookFactor([2, 1.4], 3.5, 40, 375 / 812, elevation)).toBeCloseTo(
      fitDistanceFactor(2.2, 3.5, 40, 375 / 812),
    )
  })
})
