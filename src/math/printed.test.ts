import { describe, expect, it } from 'vitest'
import { layerShift, printedStrips } from './printed'

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

describe('printedStrips', () => {
  it('reparte la imagen en tiras a lo ancho de la página, sin huecos', () => {
    const strips = printedStrips({ cx: 0.5, at: 0, width: 1, height: 1.4, turned: false }, 4)
    expect(strips).toHaveLength(4)
    expect(strips[0]!.along).toBeCloseTo(0.125)
    expect(strips[3]!.along).toBeCloseTo(0.875)
    // El borde derecho de una tira es el izquierdo de la siguiente.
    expect(strips[0]!.positions[3]).toBeCloseTo(strips[1]!.positions[0]!)
  })

  it('la parte de arriba de la imagen queda hacia el fondo', () => {
    const [strip] = printedStrips({ cx: 0.5, at: 0, width: 1, height: 1.4, turned: false }, 1)
    // Vértice 0: x0, z0 (fondo) → v = 1 (arriba de la imagen).
    expect(strip!.uvs.slice(0, 2)).toEqual([0, 1])
  })

  it('con la bisagra arriba, la parte de arriba queda hacia el lomo', () => {
    const [strip] = printedStrips({ cx: 0.45, at: 0, width: 1.4, height: 0.9, turned: true }, 1)
    // Vértice 0: junto al lomo (x0) → v = 1.
    expect(strip!.uvs[1]).toBeCloseTo(1)
    // Vértice 1: borde de la página (x1) → v = 0.
    expect(strip!.uvs[3]).toBeCloseTo(0)
  })
})
