import { describe, expect, it } from 'vitest'
import { closedOverflow } from './closed-fit'
import { parallelFold, tentFold } from './parallel-fold'
import { vFold } from './v-fold'

const page: [number, number] = [1, 1.4]

describe('closedOverflow', () => {
  it('cabe si todo queda dentro de la página', () => {
    expect(closedOverflow([[0.5, 0, 0.3]], page)).toBe(0)
  })

  it('mide cuánto asoma por el borde o por arriba y abajo', () => {
    expect(closedOverflow([[1.2, 0, 0]], page)).toBeCloseTo(0.2)
    expect(closedOverflow([[0.5, 0, 0.8]], page)).toBeCloseTo(0.1)
  })

  it('una tienda demasiado alta asoma por el borde al cerrar', () => {
    const { C } = parallelFold(0, tentFold(0.4, 0.7))
    expect(closedOverflow([[C[0], 0, 0]], page)).toBeCloseTo(0.1)
  })

  it('una V larga cerca del borde inferior asoma al cerrar', () => {
    // Vértice cerca del borde inferior y líneas de pegado hacia el frente.
    const { right } = vFold(0, (30 * Math.PI) / 180, (80 * Math.PI) / 180, 1)
    const tip: [number, number, number] = [right[0] * 0.3, 0, 0.6 + right[2] * 0.3]
    expect(closedOverflow([tip], page)).toBeGreaterThan(0)
  })
})
