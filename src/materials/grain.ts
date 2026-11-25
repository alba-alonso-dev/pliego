import { seededRandom } from '../math/rough-edges'

/**
 * Relieve del papel: varias capas de ruido suave (las ondulaciones de la
 * pasta) más fibras finas y alargadas. Devuelve alturas en [0, 1] en una
 * cuadrícula `size × size` que se repite sin costuras.
 */
export function grainHeights(size: number, seed = 1): Float32Array {
  const random = seededRandom(seed)
  const heights = new Float32Array(size * size)

  const octave = (cells: number, weight: number) => {
    const grid = Array.from({ length: cells * cells }, () => random())
    const at = (x: number, y: number) =>
      grid[((y + cells) % cells) * cells + ((x + cells) % cells)]!
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const gx = (x / size) * cells
        const gy = (y / size) * cells
        const ix = Math.floor(gx)
        const iy = Math.floor(gy)
        const fx = gx - ix
        const fy = gy - iy
        const sx = fx * fx * (3 - 2 * fx)
        const sy = fy * fy * (3 - 2 * fy)
        const top = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * sx
        const bottom = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * sx
        heights[y * size + x]! += (top + (bottom - top) * sy) * weight
      }
    }
  }
  octave(8, 0.35)
  octave(32, 0.35)
  octave(size, 0.15)

  // Fibras: trazos cortos con orientación aleatoria.
  const fibers = Math.round(size * size * 0.004)
  for (let f = 0; f < fibers; f++) {
    let x = random() * size
    let y = random() * size
    const angle = random() * Math.PI
    const length = 4 + random() * 10
    const strength = 0.1 + random() * 0.1
    for (let s = 0; s < length; s++) {
      const i = (Math.floor(y + size) % size) * size + (Math.floor(x + size) % size)
      heights[i] = heights[i]! + strength
      x += Math.cos(angle)
      y += Math.sin(angle)
    }
  }

  let min = Infinity
  let max = -Infinity
  for (const h of heights) {
    min = Math.min(min, h)
    max = Math.max(max, h)
  }
  const range = max - min || 1
  for (let i = 0; i < heights.length; i++) heights[i] = (heights[i]! - min) / range
  return heights
}

/**
 * Convierte alturas en un mapa de normales RGBA (espacio tangente),
 * con diferencias centradas y bordes que se repiten.
 */
export function heightsToNormalMap(heights: Float32Array, size: number, strength = 2): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  const h = (x: number, y: number) => heights[((y + size) % size) * size + ((x + size) % size)]!
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength
      const length = Math.hypot(dx, dy, 1)
      const i = (y * size + x) * 4
      data[i] = Math.round(((-dx / length) * 0.5 + 0.5) * 255)
      data[i + 1] = Math.round(((-dy / length) * 0.5 + 0.5) * 255)
      data[i + 2] = Math.round(((1 / length) * 0.5 + 0.5) * 255)
      data[i + 3] = 255
    }
  }
  return data
}
