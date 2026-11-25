import { describe, expect, it } from 'vitest'
import { woodPixels } from './wood'

describe('woodPixels', () => {
  const size = 64

  it('genera un píxel RGBA opaco por posición', () => {
    const data = woodPixels(size)
    expect(data).toHaveLength(size * size * 4)
    for (let i = 3; i < data.length; i += 4) expect(data[i]).toBe(255)
  })

  it('es determinista con la misma semilla y cambia con otra', () => {
    expect(woodPixels(size, { seed: 3 })).toEqual(woodPixels(size, { seed: 3 }))
    expect(woodPixels(size, { seed: 3 })).not.toEqual(woodPixels(size, { seed: 4 }))
  })

  it('tiene vetas: no es un color plano', () => {
    const data = woodPixels(size)
    const reds = new Set<number>()
    for (let i = 0; i < data.length; i += 4) reds.add(data[i]!)
    expect(reds.size).toBeGreaterThan(10)
  })
})

it('el tono medio queda cerca del color claro pedido (en sRGB)', () => {
  const data = woodPixels(128, { light: '#e0e0e0', dark: '#a0a0a0' })
  let sum = 0
  for (let i = 0; i < data.length; i += 4) sum += data[i]!
  const mean = sum / (data.length / 4)
  expect(mean).toBeGreaterThan(0xd0)
  expect(mean).toBeLessThan(0xe8)
})
