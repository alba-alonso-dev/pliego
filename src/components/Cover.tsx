import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { leafPose, leafProgress } from '../math/book'
import { useBookStore } from '../store'
import { useBookContext } from './context'

/**
 * Lo que va pegado sobre la cara de fuera de la tapa (`<Book cover>`).
 * Gira con la tapa al abrir el libro y deja de verse cuando queda boca
 * abajo. Sus hijos usan las mismas coordenadas que un spread: el lomo en
 * x = 0, la tapa de x = 0 a x = ancho e y = 0 sobre el papel.
 */
export function Cover({ children }: { children?: ReactNode }) {
  const { size, thickness, count } = useBookContext()
  const frame = useRef<Group>(null)

  useFrame(() => {
    if (!frame.current) return
    const position = useBookStore.getState().position
    const pose = leafPose(position, 0, count, thickness, size[0])
    frame.current.rotation.z = pose.angle
    frame.current.position.y = pose.y
    // Pasada la mitad del giro, la cara de fuera mira a la mesa.
    frame.current.visible = leafProgress(position, 0) < 0.5
  })

  return (
    <group ref={frame}>
      <group position={[0, thickness.cover / 2, 0]}>{children}</group>
    </group>
  )
}
