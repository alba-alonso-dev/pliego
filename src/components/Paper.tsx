import type { ThreeElements } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { ExtrudeGeometry } from 'three'
import {
  fitOutlines,
  outlinesFromSvg,
  shapeFromOutline,
  type Anchor,
  type Outline,
} from '../paper/outline'

export interface PaperProps extends Omit<ThreeElements['group'], 'children'> {
  /** Texto de un archivo SVG (por ejemplo, importado con `?raw`). */
  src?: string
  /** Contornos ya preparados, en lugar de `src`. */
  outlines?: Outline[]
  /** Color de la cartulina. */
  color?: string
  /** Grosor de la cartulina, en unidades del mundo. */
  depth?: number
  /** Ancho final de la pieza. */
  width?: number
  /** Alto final de la pieza (si no se da `width`). */
  height?: number
  /** `bottom`: el origen está en el centro del borde inferior. */
  anchor?: Anchor
}

/** Grosor por defecto: una cartulina de ~1,5 mm si la página mide 20 cm. */
export const DEFAULT_PAPER_DEPTH = 0.0075

/**
 * Una pieza de cartulina: una forma SVG extruida con un poco de grosor,
 * de pie en el plano XY y centrada en Z.
 */
export function Paper({
  src,
  outlines: outlinesProp,
  color = '#f4ead5',
  depth = DEFAULT_PAPER_DEPTH,
  width,
  height,
  anchor = 'bottom',
  ...group
}: PaperProps) {
  const geometry = useMemo(() => {
    const raw = outlinesProp ?? (src ? outlinesFromSvg(src) : [])
    const fitted = fitOutlines(raw, { width, height, anchor })
    const extruded = new ExtrudeGeometry(fitted.map(shapeFromOutline), {
      depth,
      bevelEnabled: false,
      curveSegments: 1,
    })
    extruded.translate(0, 0, -depth / 2)
    return extruded
  }, [src, outlinesProp, width, height, anchor, depth])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group {...group}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
      </mesh>
    </group>
  )
}
