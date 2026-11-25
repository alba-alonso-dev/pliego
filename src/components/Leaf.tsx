import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { paperMaterials } from '../materials/paper'
import type { Group } from 'three'
import { leafAngle, leafProgress, leafThickness, leftStackY, rightStackY } from '../math/book'
import { lerp } from '../math/easing'
import { useBookStore } from '../store'
import { useBookContext } from './context'

export interface LeafProps {
  index: number
  /** Color de la cara de arriba cuando la hoja está a la derecha. */
  front: string
  /** Color de la cara que queda arriba al pasarla. */
  back: string
  /** Color del canto. */
  edge: string
}

/**
 * Una hoja rígida que gira sobre la bisagra (el eje Z, en x = 0).
 * Lee la posición del store en cada fotograma, sin re-renderizar React.
 */
export function Leaf({ index, front, back, edge }: LeafProps) {
  const { size, thickness, count } = useBookContext()
  const [width, height] = size
  const depth = leafThickness(index, thickness)
  const pivot = useRef<Group>(null)

  useFrame(() => {
    const group = pivot.current
    if (!group) return
    const { position } = useBookStore.getState()
    const progress = leafProgress(position, index)
    group.rotation.z = leafAngle(position, index)
    group.position.y = lerp(
      rightStackY(index, count, thickness),
      leftStackY(index, thickness),
      progress,
    )
    // Mientras gira, se eleva un poco para no atravesar las otras hojas.
    group.position.y += Math.sin(progress * Math.PI) * 0.02
  })

  // Orden de materiales de BoxGeometry: +x, -x, +y, -y, +z, -z.
  const material = useMemo(() => {
    const side = paperMaterials(edge).face
    return [side, side, paperMaterials(front).face, paperMaterials(back).face, side, side]
  }, [front, back, edge])

  return (
    <group ref={pivot}>
      <mesh position={[width / 2, 0, 0]} material={material} castShadow receiveShadow>
        <boxGeometry args={[width, depth, height]} />
      </mesh>
    </group>
  )
}
