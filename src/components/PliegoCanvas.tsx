import { PerformanceMonitor } from '@react-three/drei'
import { Canvas, useThree, type CanvasProps } from '@react-three/fiber'
import { useEffect, useState, type ReactNode } from 'react'
import { NoToneMapping, NeutralToneMapping, PCFShadowMap } from 'three'
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
  /**
   * Calidad adaptable: si el dispositivo no llega a unos 30 fps, baja la
   * resolución y quita el postprocesado; si se recupera, los devuelve.
   */
  adaptive?: boolean
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
  adaptive = true,
  ...props
}: PliegoCanvasProps) {
  const [degraded, setDegraded] = useState(false)
  const showEffects = Boolean(effects) && !degraded
  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      dpr={degraded ? 1 : [1, 2]}
      camera={{ position: cameraPosition, fov }}
      // Con postprocesado, el tone mapping lo hace el último efecto.
      flat={Boolean(effects)}
      onCreated={({ gl }) => {
        if (!effects) gl.toneMapping = NeutralToneMapping
      }}
      {...props}
    >
      {adaptive && (
        <PerformanceMonitor
          bounds={() => [30, 55]}
          onDecline={() => setDegraded(true)}
          onIncline={() => setDegraded(false)}
          flipflops={3}
          onFallback={() => setDegraded(true)}
        />
      )}
      <CameraRig position={cameraPosition} target={target} parallax={parallax || 0} />
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[background, 4.5, 9]} />
      <PaperLights {...lights} />
      {table && <Table {...(table === true ? {} : table)} />}
      {children}
      {/* Sin postprocesado, el tone mapping lo hace el renderizador. */}
      {Boolean(effects) && <ToneMappingFallback active={degraded} />}
      {showEffects && <PaperEffects {...(effects === true ? {} : effects)} />}
    </Canvas>
  )
}

/** Si se quita el postprocesado por rendimiento, el renderizador pasa a hacer el tone mapping. */
function ToneMappingFallback({ active }: { active: boolean }) {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    gl.toneMapping = active ? NeutralToneMapping : NoToneMapping
  }, [gl, active])
  return null
}
