import { describe, expect, it } from 'vitest'
import { depthDelay, elevation, MAX_DEPTH_DELAY, pivotRotationX, unfoldProgress } from './fold'

describe('elevation', () => {
  it('tumbada con el libro cerrado y de pie con el libro abierto', () => {
    expect(elevation(0)).toBe(0)
    expect(elevation(180)).toBe(90)
  })

  it('respeta el ángulo final de cada pieza', () => {
    expect(elevation(180, 70)).toBe(70)
  })

  it('con la hoja a 90° la pieza va a medio levantar, algo por detrás', () => {
    expect(elevation(90)).toBeGreaterThan(25)
    expect(elevation(90)).toBeLessThan(45)
  })

  it('empieza a moverse en cuanto se abre la hoja, sin esperar tumbada', () => {
    expect(elevation(20, 90, MAX_DEPTH_DELAY)).toBeGreaterThan(0.5)
  })

  it('sube a medida que el libro se abre, sin bajar nunca', () => {
    let previous = 0
    for (let theta = 0; theta <= 180; theta += 5) {
      const phi = elevation(theta, 90, 0.2)
      expect(phi).toBeGreaterThanOrEqual(previous)
      previous = phi
    }
  })
})

describe('unfoldProgress con retardo', () => {
  it('el retardo hace la curva más tardía, sin dejar la pieza quieta', () => {
    expect(unfoldProgress(0.3 * 180, 0.3)).toBeGreaterThan(0)
    expect(unfoldProgress(90, 0.3)).toBeLessThan(unfoldProgress(90, 0))
    expect(unfoldProgress(0)).toBe(0)
    expect(unfoldProgress(180, 0.3)).toBe(1)
  })

  it('un retardo exagerado no impide que termine de pie', () => {
    expect(unfoldProgress(180, 2)).toBe(1)
  })
})

describe('depthDelay', () => {
  const height = 1.4

  it('las piezas del fondo se levantan antes', () => {
    expect(depthDelay(-0.7, height)).toBe(0)
    expect(depthDelay(0, height)).toBeCloseTo(MAX_DEPTH_DELAY / 2)
    expect(depthDelay(0.7, height)).toBeCloseTo(MAX_DEPTH_DELAY)
  })

  it('a la misma apertura, la pieza del fondo está más levantada', () => {
    const theta = 110
    const back = elevation(theta, 90, depthDelay(-0.5, height))
    const front = elevation(theta, 90, depthDelay(0.5, height))
    expect(back).toBeGreaterThan(front)
  })
})

describe('pivotRotationX', () => {
  it('de pie no gira y tumbada gira -90°', () => {
    expect(pivotRotationX(90)).toBeCloseTo(0)
    expect(pivotRotationX(0)).toBeCloseTo(-Math.PI / 2)
  })
})
