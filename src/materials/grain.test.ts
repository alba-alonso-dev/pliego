import { describe, expect, it } from 'vitest'
import { grainHeights, heightsToNormalMap } from './grain'

describe('grainHeights', () => {
  const size = 32
  const heights = grainHeights(size, 5)

  it('ocupa todo el intervalo [0, 1]', () => {
    expect(Math.min(...heights)).toBe(0)
    expect(Math.max(...heights)).toBe(1)
  })

  it('es determinista con la misma semilla', () => {
    expect(grainHeights(size, 5)).toEqual(heights)
    expect(grainHeights(size, 6)).not.toEqual(heights)
  })
})

describe('heightsToNormalMap', () => {
  it('un papel liso da normales que miran hacia fuera', () => {
    const flat = heightsToNormalMap(new Float32Array(16).fill(0.5), 4)
    expect(Array.from(flat.slice(0, 4))).toEqual([128, 128, 255, 255])
  })

  it('genera un píxel RGBA por altura, con normales casi de frente', () => {
    const size = 16
    const map = heightsToNormalMap(grainHeights(size, 1), size)
    expect(map).toHaveLength(size * size * 4)
    for (let i = 0; i < map.length; i += 4) expect(map[i + 2]).toBeGreaterThan(180)
  })
})
