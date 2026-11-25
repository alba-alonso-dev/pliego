import { describe, expect, it } from 'vitest'
import { layerShift } from './printed'

describe('layerShift', () => {
  it('quieta con el puntero en el centro', () => {
    expect(layerShift([0, 0], [0.02, 0.02])).toEqual([0, 0])
  })

  it('se mueve con el puntero hasta su recorrido máximo', () => {
    expect(layerShift([1, -0.5], [0.02, 0.01])).toEqual([0.02, -0.005])
    expect(layerShift([3, 3], [0.02, 0.01])).toEqual([0.02, 0.01])
  })

  it('una capa sin parallax no se mueve', () => {
    expect(layerShift([1, 1], [0, 0])).toEqual([0, 0])
  })
})
