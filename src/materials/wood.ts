import { Color, SRGBColorSpace } from 'three'
import { seededRandom } from '../math/rough-edges'

export interface WoodOptions {
  /** Tono claro de la madera. */
  light?: string
  /** Tono de las vetas. */
  dark?: string
  /** Número de tablas a lo alto de la textura. */
  planks?: number
  seed?: number
}

/**
 * Textura de madera clara generada por código: tablas horizontales con un
 * tono algo distinto cada una, vetas onduladas y juntas finas. Devuelve
 * píxeles RGBA (`size × size`) que se repiten sin costuras en horizontal.
 */
export function woodPixels(size: number, options: WoodOptions = {}): Uint8Array {
  const { light = '#e9dcc6', dark = '#c8ab84', planks = 4, seed = 7 } = options
  const random = seededRandom(seed)
  // Los píxeles van en sRGB, igual que los colores escritos en hexadecimal;
  // Color guarda internamente valores lineales, así que hay que pedirlos en sRGB.
  const a = new Color(light).getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace)
  const b = new Color(dark).getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace)
  const plankHeight = size / planks
  const tints = Array.from({ length: planks }, () => 0.96 + random() * 0.08)
  const phases = Array.from({ length: planks }, () => random() * 100)
  const data = new Uint8Array(size * size * 4)

  for (let y = 0; y < size; y++) {
    const plank = Math.floor(y / plankHeight)
    const inPlank = (y % plankHeight) / plankHeight
    const tint = tints[plank]!
    const phase = phases[plank]!
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2
      // Vetas: líneas a lo largo de la tabla que ondulan suavemente.
      const wave = Math.sin(u * 2 + phase) * 0.25 + Math.sin(u * 7 + phase * 2) * 0.08
      const rings = Math.sin((inPlank * 22 + wave) * Math.PI * 2)
      const grain = Math.pow(Math.abs(rings), 10) * 0.35 + random() * 0.06
      // Junta algo más oscura entre tablas.
      const joint = inPlank < 0.01 || inPlank > 0.99 ? 0.45 : 0
      const k = Math.min(1, grain + joint)
      const i = (y * size + x) * 4
      data[i] = Math.round(Math.min(1, (a.r + (b.r - a.r) * k) * tint) * 255)
      data[i + 1] = Math.round(Math.min(1, (a.g + (b.g - a.g) * k) * tint) * 255)
      data[i + 2] = Math.round(Math.min(1, (a.b + (b.b - a.b) * k) * tint) * 255)
      data[i + 3] = 255
    }
  }
  return data
}
