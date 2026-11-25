import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import {
  fitStrokes,
  pickSource,
  resample,
  strokesFromSvg,
  type HandDrawnSource,
} from '../paper/strokes'
import { useBookStore } from '../store'
import { OnPage } from './OnPage'

export interface HandDrawnProps {
  /** Texto de un SVG de trazos (importado con `?raw`), o uno por idioma. */
  src: HandDrawnSource
  /** Centro del dibujo en x (el lomo está en x = 0). */
  x?: number
  /** Centro del dibujo en z: de -alto/2 (fondo de la página) a +alto/2 (frente). */
  at?: number
  /** Página sobre la que va. Por defecto, la del lado de `x`. */
  side?: 'left' | 'right'
  /** Ancho del dibujo en unidades del mundo. */
  width?: number
  /** Alto del dibujo (si no se da `width`). */
  height?: number
  /** Giro del dibujo sobre la página, en grados (positivo = antihorario). */
  rotate?: number
  /** Color de la tinta. */
  color?: string
  /** Grosor del trazo en unidades del mundo. */
  lineWidth?: number
}

/** Altura de la tinta sobre el papel, para que no parpadee con él. */
export const INK_LIFT = 0.0008

/** Distancia máxima entre puntos del trazo, en unidades del mundo. */
const STROKE_STEP = 0.004

/**
 * Trazo a mano pegado sobre el papel: un SVG de líneas (anotaciones,
 * flechas, una firma) dibujado con tinta sobre la página. Va con su hoja
 * al pasarla, como si estuviera impreso.
 */
export function HandDrawn({
  src,
  x = 0,
  at = 0,
  side,
  width,
  height,
  rotate = 0,
  color = '#2b2420',
  lineWidth = 0.004,
}: HandDrawnProps) {
  const lang = useBookStore((state) => state.lang)
  const svg = pickSource(src, lang)
  const page = side ?? (x < 0 ? 'left' : 'right')

  const strokes = useMemo(
    () =>
      fitStrokes(strokesFromSvg(svg), {
        width,
        height: width === undefined ? (height ?? 0.3) : undefined,
      }).map((stroke) => resample(stroke, STROKE_STEP)),
    [svg, width, height],
  )

  return (
    <OnPage side={page} lift={INK_LIFT}>
      <group position={[x, 0, at]} rotation={[0, (rotate * Math.PI) / 180, 0]}>
        {/* El dibujo se tumba sobre el papel con su parte de arriba hacia el fondo. */}
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {strokes.map((stroke, i) => (
            <Line
              key={i}
              points={stroke.map(([px, py]) => [px, py, 0] as [number, number, number])}
              color={color}
              lineWidth={lineWidth}
              worldUnits
            />
          ))}
        </group>
      </group>
    </OnPage>
  )
}
