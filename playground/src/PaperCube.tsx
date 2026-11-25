import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useRef } from 'react'
import type { Group } from 'three'

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Cubo de cartulina: seis caras de colores planos y sin brillo.
 * Escena de prueba del hito v0.0; el material de papel de verdad llega en v0.2.
 */
export function PaperCube() {
  const group = useRef<Group>(null)

  useFrame((state, delta) => {
    const cube = group.current
    if (!cube || reducedMotion) return
    cube.rotation.y += delta * 0.5
    cube.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.25
    cube.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
  })

  const colors = ['#d98e6a', '#e9c46a', '#8ab17d', '#5b8e7d', '#f4ead5', '#c0614b']

  return (
    <group ref={group} rotation={[0.35, 0.6, 0]}>
      <RoundedBox args={[1, 1, 1]} radius={0.015} smoothness={2} castShadow receiveShadow>
        {colors.map((color, i) => (
          <meshStandardMaterial
            key={color}
            attach={`material-${i}`}
            color={color}
            roughness={0.92}
            metalness={0}
          />
        ))}
      </RoundedBox>
    </group>
  )
}
