// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { bounds, fitOutlines, outlinesFromSvg, shapeFromOutline } from './outline'

const casa = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
  <path d="M0 120 V50 L50 0 L100 50 V120 Z M40 120 V80 H60 V120 Z" fill="#d98e6a" />
  <rect x="10" y="60" width="20" height="20" fill="#fbf7ee" />
  <path d="M0 0 L100 100" fill="none" stroke="#000" />
</svg>`

describe('outlinesFromSvg', () => {
  it('lee las formas rellenas e ignora los trazos sin relleno', () => {
    const outlines = outlinesFromSvg(casa)
    expect(outlines).toHaveLength(2)
  })

  it('no repite el primer punto al final', () => {
    const [rect] = outlinesFromSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="5" /></svg>',
    )
    expect(rect?.contour).toHaveLength(4)
  })
})

describe('fitOutlines', () => {
  const outlines = outlinesFromSvg(casa)

  it('escala al ancho pedido y apoya la pieza en y = 0', () => {
    const fitted = fitOutlines(outlines, { width: 0.5 })
    const box = bounds(fitted)
    expect(box.width).toBeCloseTo(0.5)
    expect(box.minY).toBeCloseTo(0)
    expect(box.height).toBeCloseTo(0.6)
    expect(box.minX).toBeCloseTo(-0.25)
  })

  it('invierte el eje Y: el tejado queda arriba', () => {
    const [house] = fitOutlines(outlines, { height: 1 })
    const top = house!.contour.reduce((a, b) => (b[1] > a[1] ? b : a))
    expect(top[0]).toBeCloseTo(0)
    expect(top[1]).toBeCloseTo(1)
  })

  it('con anchor center centra la pieza', () => {
    const box = bounds(fitOutlines(outlines, { height: 1, anchor: 'center' }))
    expect(box.minY).toBeCloseTo(-0.5)
    expect(box.maxY).toBeCloseTo(0.5)
  })

  it('devuelve vacío si no hay formas', () => {
    expect(fitOutlines([], { width: 1 })).toEqual([])
  })
})

describe('shapeFromOutline', () => {
  it('conserva los agujeros', () => {
    const [house] = fitOutlines(outlinesFromSvg(casa), { width: 1 })
    expect(shapeFromOutline(house!).holes.length).toBe(house!.holes.length)
  })
})
