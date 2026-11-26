import { describe, expect, it } from 'vitest'
import { Color } from 'three'
import { EDGE_CORE, PAPER_CORE, paperMaterials } from './paper'

describe('paperMaterials', () => {
  it('el canto de una cartulina de color es más claro que su cara (se ve el alma blanca)', () => {
    const { face, edge } = paperMaterials('#c0614b')
    expect(edge.color.getHSL({ h: 0, s: 0, l: 0 }).l).toBeGreaterThan(
      face.color.getHSL({ h: 0, s: 0, l: 0 }).l,
    )
  })

  it('el canto queda entre el color de la cara y el alma del papel', () => {
    const { edge } = paperMaterials('#000000')
    const core = new Color(PAPER_CORE)
    expect(edge.color.r).toBeCloseTo(core.r * EDGE_CORE)
  })

  it('reutiliza los materiales del mismo color', () => {
    expect(paperMaterials('#5b8e7d')).toBe(paperMaterials('#5b8e7d'))
  })
})
