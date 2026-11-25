import { Canvas, useThree, type CanvasProps } from '@react-three/fiber'
import { useLayoutEffect, type ReactNode } from 'react'
import { PCFShadowMap } from 'three'
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
  /** Ajustes de la luz principal y de las sombras. */
  lights?: PaperLightsProps
}

function LookAt({ target }: { target: Vec3 }) {
  const camera = useThree((state) => state.camera)
  const [x, y, z] = target
  useLayoutEffect(() => {
    camera.lookAt(x, y, z)
    camera.updateProjectionMatrix()
  }, [camera, x, y, z])
  return null
}

/**
 * Lienzo base de un libro: cámara mirando a la mesa, luz cálida con
 * sombras suaves y sombra de contacto bajo el libro.
 */
export function PliegoCanvas({
  children,
  background = '#f3ede2',
  cameraPosition = [0, 2.6, 2.3],
  target = [0, 0, 0.1],
  fov = 40,
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
      <LookAt target={target} />
      <color attach="background" args={[background]} />
      <PaperLights {...lights} />
      {children}
    </Canvas>
  )
}
