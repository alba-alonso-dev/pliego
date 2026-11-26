import { describe, expect, it } from 'vitest'
import { approach, dragProgress, holdStep } from './gesture'

describe('dragProgress', () => {
  it('avanza en proporción al arrastre y satura en [0, 1]', () => {
    expect(dragProgress(0, 100, 200)).toBeCloseTo(0.5)
    expect(dragProgress(0.5, -50, 200)).toBeCloseTo(0.25)
    expect(dragProgress(0.9, 500, 200)).toBe(1)
    expect(dragProgress(0.1, -500, 200)).toBe(0)
  })
})

describe('holdStep', () => {
  it('sube mientras se mantiene pulsado', () => {
    expect(holdStep(0, 0.5, 2, true)).toBeCloseTo(0.25)
    expect(holdStep(0.9, 1, 2, true)).toBe(1)
  })

  it('al soltar se queda o vuelve según `release`', () => {
    expect(holdStep(0.6, 0.5, 2, false, 'stay')).toBeCloseTo(0.6)
    expect(holdStep(0.6, 0.5, 2, false, 'return')).toBeCloseTo(0.35)
  })

  it('con duración 0 salta al extremo', () => {
    expect(holdStep(0.2, 0.01, 0, true)).toBe(1)
    expect(holdStep(0.2, 0.01, 0, false, 'return')).toBe(0)
  })
})

describe('approach', () => {
  it('se acerca al objetivo a ritmo constante sin pasarse', () => {
    expect(approach(0, 1, 0.25, 1)).toBeCloseTo(0.25)
    expect(approach(0.9, 1, 0.25, 1)).toBe(1)
    expect(approach(1, 0, 0.5, 1)).toBeCloseTo(0.5)
    expect(approach(0.3, 1, 0.1, 0)).toBe(1)
  })
})
