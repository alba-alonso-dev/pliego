import { Canvas, type CanvasProps } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { NeutralToneMapping, PCFShadowMap } from 'three'
import { CameraRig } from './CameraRig'
import { PaperEffects, type PaperEffectsProps } from './PaperEffects'
import { PaperLights, type PaperLightsProps } from './PaperLights'
import { Table, type TableProps } from './Table'

type Vec3 = [number, number, number]

export interface PliegoCanvasProps extends Omit<CanvasProps, 'children' | 'camera'> {
  children?: ReactNode
  /** Color de fondo de la escena; la mesa se funde con él a lo lejos. */
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
  /** Mesa de madera bajo el libro: `false` la quita; un objeto la ajusta. */
  table?: boolean | TableProps
  /** Postprocesado (oclusión ambiental, viñeta…): `false` lo quita. */
  effects?: boolean | PaperEffectsProps
}

/** Parallax por defecto: lo justo para que las capas se separen. */
export const DEFAULT_PARALLAX = 0.18

/**
 * Lienzo base de un libro: una mesa de madera, cámara con un ligero
 * parallax, luz cálida con sombras suaves y un postprocesado discreto.
 */
export function PliegoCanvas({
  children,
  background = '#efe6d6',
  cameraPosition = [0, 2.6, 2.3],
  target = [0, 0, 0.1],
  fov = 40,
  parallax = DEFAULT_PARALLAX,
  lights,
  table = true,
  effects = true,
  ...props
}: PliegoCanvasProps) {
  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      dpr={[1, 2]}
      camera={{ position: cameraPosition, fov }}
      // Con postprocesado, el tone mapping lo hace el último efecto.
      flat={Boolean(effects)}
      onCreated={({ gl }) => {
        if (!effects) gl.toneMapping = NeutralToneMapping
      }}
      {...props}
    >
      <CameraRig position={cameraPosition} target={target} parallax={parallax || 0} />
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[background, 4.5, 9]} />
      <PaperLights {...lights} />
      {table && <Table {...(table === true ? {} : table)} />}
      {children}
      {effects && <PaperEffects {...(effects === true ? {} : effects)} />}
    </Canvas>
  )
}
