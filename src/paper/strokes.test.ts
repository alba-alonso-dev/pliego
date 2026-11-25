// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { fitStrokes, pickSource, resample, strokeLength, strokesFromSvg } from './strokes'

const flecha = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
  <path d="M5 20 C30 10 60 30 90 20" fill="none" stroke="#000" />
  <path d="M80 12 L90 20 L80 28" fill="none" stroke="#000" />
</svg>`

describe('strokesFromSvg', () => {
  it('da un trazo por cada subtrazo', () => {
    expect(strokesFromSvg(flecha)).toHaveLength(2)
  })

  it('convierte las curvas en varios puntos y los rectos en sus vértices', () => {
    const [curva, punta] = strokesFromSvg(flecha)
    expect(curva!.length).toBeGreaterThan(10)
    expect(punta).toEqual([
      [80, 12],
      [90, 20],
      [80, 28],
    ])
  })

  it('ignora los subtrazos de un solo punto', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M5 5" stroke="#000" /></svg>'
    expect(strokesFromSvg(svg)).toHaveLength(0)
  })
})

describe('fitStrokes', () => {
  it('escala al ancho pedido, centra el dibujo e invierte el eje Y', () => {
    const fitted = fitStrokes(strokesFromSvg(flecha), { width: 0.5 })
    const xs = fitted.flat().map(([x]) => x)
    const ys = fitted.flat().map(([, y]) => y)
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(0.5)
    expect(Math.max(...xs) + Math.min(...xs)).toBeCloseTo(0)
    expect(Math.max(...ys) + Math.min(...ys)).toBeCloseTo(0)
    // La punta de arriba (y = 12 en el SVG) queda arriba (y > 0).
    const punta = fitted[1]!
    expect(punta[0]![1]).toBeGreaterThan(punta[2]![1])
  })
})

describe('resample', () => {
  it('reparte un tramo largo en pasos cortos sin cambiar la forma', () => {
    const stroke = resample(
      [
        [0, 0],
        [1, 0],
      ],
      0.1,
    )
    expect(stroke).toHaveLength(11)
    expect(stroke[5]![0]).toBeCloseTo(0.5)
    expect(strokeLength(stroke)).toBeCloseTo(1)
  })
})

describe('strokeLength', () => {
  it('suma los tramos', () => {
    expect(
      strokeLength([
        [0, 0],
        [3, 4],
        [3, 0],
      ]),
    ).toBe(9)
  })
})

describe('pickSource', () => {
  it('usa el SVG del idioma activo y, si falta, el primero', () => {
    const src = { es: 'nota-es', en: 'nota-en' }
    expect(pickSource(src, 'en')).toBe('nota-en')
    expect(pickSource(src, 'fr')).toBe('nota-es')
    expect(pickSource(src, null)).toBe('nota-es')
    expect(pickSource('solo', 'en')).toBe('solo')
  })
})
