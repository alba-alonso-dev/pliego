import type { ThreeElements } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { ExtrudeGeometry } from 'three'
import { hashSeed, roughenOutlines } from '../math/rough-edges'
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
  /**
   * Irregularidad del borde, en unidades del mundo (0 o `false` = borde
   * perfecto). Simula un recorte a tijera.
   */
  roughEdges?: number | false
  /** Semilla del borde irregular; por defecto depende de la forma. */
  seed?: number
}

/** Irregularidad por defecto del borde: ~0,6 mm si la página mide 20 cm. */
export const DEFAULT_ROUGH_EDGES = 0.003

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
  roughEdges = DEFAULT_ROUGH_EDGES,
  seed,
  ...group
}: PaperProps) {
  const geometry = useMemo(() => {
    const raw = outlinesProp ?? (src ? outlinesFromSvg(src) : [])
    let fitted = fitOutlines(raw, { width, height, anchor })
    if (roughEdges) {
      fitted = roughenOutlines(fitted, {
        amount: roughEdges,
        // Dos piezas con la misma forma pero distinto tamaño no se recortan igual.
        seed: seed ?? hashSeed(src ?? '') + Math.round((width ?? height ?? 1) * 1000),
      })
    }
    const extruded = new ExtrudeGeometry(fitted.map(shapeFromOutline), {
      depth,
      bevelEnabled: false,
      curveSegments: 1,
    })
    extruded.translate(0, 0, -depth / 2)
    return extruded
  }, [src, outlinesProp, width, height, anchor, depth, roughEdges, seed])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group {...group}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
      </mesh>
    </group>
  )
}
