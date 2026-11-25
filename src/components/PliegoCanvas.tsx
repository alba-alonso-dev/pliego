import { Canvas, type CanvasProps } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { PCFSoftShadowMap } from 'three'
import type { ReactNode } from 'react'

export interface PliegoCanvasProps extends Omit<CanvasProps, 'children'> {
  children?: ReactNode
  /** Color de fondo de la escena. */
  background?: string
}

/**
 * Lienzo base de un libro: cámara, luz cálida con sombras suaves
 * y sombra de contacto bajo el libro.
 */
export function PliegoCanvas({ children, background = '#f3ede2', ...props }: PliegoCanvasProps) {
  return (
    <Canvas
      shadows={{ type: PCFSoftShadowMap }}
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 3.2], fov: 40 }}
      {...props}
    >
      <color attach="background" args={[background]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[2.5, 4, 2]}
        intensity={2.2}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />
      {children}
      <ContactShadows position={[0, -0.6, 0]} opacity={0.35} blur={2.5} scale={6} far={2} />
    </Canvas>
  )
}
