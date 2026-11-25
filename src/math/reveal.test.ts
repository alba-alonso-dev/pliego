import { describe, expect, it } from 'vitest'
import { DEFAULT_REVEAL, revealProgress, visibleSegments } from './reveal'

describe('visibleSegments', () => {
  const segments = [10, 30, 10]

  it('al principio no se ve nada y al final se ve todo', () => {
    expect(visibleSegments(segments, 0)).toEqual([0, 0, 0])
    expect(visibleSegments(segments, 1)).toEqual(segments)
  })

  it('dibuja los trazos en orden, uno detrás de otro', () => {
    expect(visibleSegments(segments, 0.1)).toEqual([5, 0, 0])
    expect(visibleSegments(segments, 0.5)).toEqual([10, 15, 0])
    expect(visibleSegments(segments, 0.9)).toEqual([10, 30, 5])
  })

  it('satura fuera de [0, 1]', () => {
    expect(visibleSegments(segments, -1)).toEqual([0, 0, 0])
    expect(visibleSegments(segments, 3)).toEqual(segments)
  })
})

describe('revealProgress', () => {
  it('espera el retardo y luego avanza a ritmo constante', () => {
    const timing = { duration: 2, delay: 0.5 }
    expect(revealProgress(0.4, timing)).toBe(0)
    expect(revealProgress(1.5, timing)).toBeCloseTo(0.5)
    expect(revealProgress(10, timing)).toBe(1)
  })

  it('con duración 0 aparece de golpe tras el retardo', () => {
    expect(revealProgress(0.1, { duration: 0, delay: 0.2 })).toBe(0)
    expect(revealProgress(0.3, { duration: 0, delay: 0.2 })).toBe(1)
  })

  it('por defecto tarda menos de dos segundos', () => {
    expect(revealProgress(DEFAULT_REVEAL.delay + DEFAULT_REVEAL.duration)).toBe(1)
    expect(DEFAULT_REVEAL.delay + DEFAULT_REVEAL.duration).toBeLessThan(2)
  })
})
