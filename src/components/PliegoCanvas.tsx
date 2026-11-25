import { Canvas, type CanvasProps } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { PCFShadowMap } from 'three'
import { CameraRig } from './CameraRig'
import { PaperLights, type PaperLightsProps } from './PaperLights'

type Vec3 = [number, number, number]

export interface PliegoCanvasProps extends Omit<CanvasProps, 'children' | 'camera'> {
  children?: ReactNode
  /** Color de fondo de la escena. */
  background?: string
  /** Posición de la cámara. */
  cameraPosition?: Vec3
  /** Punto al que mira la cámara. */
  target?: Vec3
  /** Campo de visión vertical, en grados. */
  fov?: number
  /**
   * Recorrido del parallax de cámara con el ratón o el giroscopio, en
   * unidades del mundo. `false` o 0 lo desactiva.
   */
  parallax?: number | false
  /** Ajustes de la luz principal y de las sombras. */
  lights?: PaperLightsProps
}

/** Parallax por defecto: lo justo para que las capas se separen. */
export const DEFAULT_PARALLAX = 0.18

/**
 * Lienzo base de un libro: cámara mirando a la mesa con un ligero
 * parallax, luz cálida con sombras suaves y sombra de contacto.
 */
export function PliegoCanvas({
  children,
  background = '#f3ede2',
  cameraPosition = [0, 2.6, 2.3],
  target = [0, 0, 0.1],
  fov = 40,
  parallax = DEFAULT_PARALLAX,
  lights,
  ...props
}: PliegoCanvasProps) {
  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      dpr={[1, 2]}
      camera={{ position: cameraPosition, fov }}
      {...props}
    >
      <CameraRig position={cameraPosition} target={target} parallax={parallax || 0} />
      <color attach="background" args={[background]} />
      <PaperLights {...lights} />
      {children}
    </Canvas>
  )
}
