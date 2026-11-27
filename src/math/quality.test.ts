import { describe, expect, it } from 'vitest'
import { qualityStep, type QualityState } from './quality'

const run = (state: QualityState, delta: number, frames: number) => {
  let s = state
  for (let i = 0; i < frames; i++) s = qualityStep(s, delta)
  return s
}

describe('qualityStep', () => {
  const start: QualityState = { samples: [], degraded: false }

  it('baja la calidad si los fotogramas seguidos van por debajo de 30 fps', () => {
    expect(run(start, 1 / 20, 60).degraded).toBe(true)
  })

  it('no la baja a 60 fps', () => {
    expect(run(start, 1 / 60, 120).degraded).toBe(false)
  })

  it('las pausas del lienzo en reposo no cuentan como fotogramas lentos', () => {
    expect(run(start, 2, 200).degraded).toBe(false)
  })

  it('la recupera cuando vuelve a ir sobrado', () => {
    const slow = run(start, 1 / 20, 60)
    expect(run(slow, 1 / 60, 60).degraded).toBe(false)
  })
})
