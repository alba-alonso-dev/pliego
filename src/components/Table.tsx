import { useEffect, useMemo } from 'react'
import {
  DataTexture,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
} from 'three'
import { woodPixels, type WoodOptions } from '../materials/wood'

export interface TableProps extends WoodOptions {
  /** Lado del tablero en unidades del mundo. */
  size?: number
  /** Veces que se repite la textura a lo ancho del tablero. */
  repeat?: number
}

const TEXTURE_SIZE = 512

/**
 * Mesa de madera clara bajo el libro. Recibe las sombras y se funde con el
 * fondo gracias a la niebla de <PliegoCanvas>.
 */
export function Table({ size = 12, repeat = 6, light, dark, planks, seed }: TableProps) {
  const texture = useMemo(() => {
    const map = new DataTexture(
      woodPixels(TEXTURE_SIZE, { light, dark, planks, seed }),
      TEXTURE_SIZE,
      TEXTURE_SIZE,
      RGBAFormat,
    )
    map.colorSpace = SRGBColorSpace
    map.wrapS = RepeatWrapping
    map.wrapT = RepeatWrapping
    map.repeat.set(repeat, repeat)
    map.minFilter = LinearMipmapLinearFilter
    map.generateMipmaps = true
    map.anisotropy = 8
    map.needsUpdate = true
    return map
  }, [light, dark, planks, seed, repeat])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={texture} roughness={0.72} metalness={0} />
    </mesh>
  )
}
