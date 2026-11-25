import { describe, expect, it } from 'vitest'
import { clamp, easeInOutCubic, easeOutCubic, lerp } from './easing'

describe('clamp', () => {
  it('limita al intervalo [0, 1] por defecto', () => {
    expect(clamp(-0.5)).toBe(0)
    expect(clamp(0.4)).toBe(0.4)
    expect(clamp(3)).toBe(1)
  })

  it('acepta otros límites', () => {
    expect(clamp(200, 0, 180)).toBe(180)
  })
})

describe('lerp', () => {
  it('interpola entre dos valores', () => {
    expect(lerp(0, 180, 0.5)).toBe(90)
    expect(lerp(10, 20, 0)).toBe(10)
    expect(lerp(10, 20, 1)).toBe(20)
  })
})

describe.each([
  ['easeInOutCubic', easeInOutCubic],
  ['easeOutCubic', easeOutCubic],
])('%s', (_name, ease) => {
  it('empieza en 0 y termina en 1', () => {
    expect(ease(0)).toBe(0)
    expect(ease(1)).toBe(1)
  })

  it('nunca decrece', () => {
    let previous = 0
    for (let i = 1; i <= 100; i++) {
      const value = ease(i / 100)
      expect(value).toBeGreaterThanOrEqual(previous)
      previous = value
    }
  })

  it('satura fuera de [0, 1]', () => {
    expect(ease(-1)).toBe(0)
    expect(ease(2)).toBe(1)
  })
})

it('easeInOutCubic pasa por el centro', () => {
  expect(easeInOutCubic(0.5)).toBeCloseTo(0.5)
})
