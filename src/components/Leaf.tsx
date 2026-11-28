import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BoxGeometry, type Group } from 'three'
import { paperMaterials } from '../materials/paper'
import { leafPose, leafProgress, leafThickness } from '../math/book'
import { curlAmount, curlColumns } from '../math/curl'
import { prefersReducedMotion } from '../motion'
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
  /** Si la hoja se curva al pasarla (las tapas son de cartón y no se curvan). */
  curl?: boolean
}

/** Holgura junto al lomo: las hojas no llegan justo a la bisagra. */
export const SPINE_GAP = 0.003

/** Tramos a lo ancho de la hoja para poder curvarla. */
const COLUMNS = 24

/**
 * Una hoja que gira sobre la bisagra (el eje Z, en x = 0). Al pasarla se
 * curva un poco: el borde libre se queda atrás, como el papel.
 * Lee la posición del store en cada fotograma, sin re-renderizar React.
 */
export function Leaf({ index, front, back, edge, curl = true }: LeafProps) {
  const { size, thickness, count } = useBookContext()
  const [width, height] = size
  const depth = leafThickness(index, thickness)
  const length = width - SPINE_GAP
  const pivot = useRef<Group>(null)

  // Caja subdividida a lo ancho, con el borde junto al lomo en x = SPINE_GAP.
  const geometry = useMemo(() => {
    const box = new BoxGeometry(length, depth, height, curl ? COLUMNS - 1 : 1, 1, 1)
    box.translate(SPINE_GAP + length / 2, 0, 0)
    return box
  }, [length, depth, height, curl])
  const rest = useMemo(() => Float32Array.from(geometry.attributes.position!.array), [geometry])
  const bent = useRef(0)
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    const group = pivot.current
    if (!group) return
    const position = useBookStore.getState().position
    const pose = leafPose(position, index, count, thickness, width)
    group.rotation.z = pose.angle
    group.position.y = pose.y

    if (!curl) return
    const bend = prefersReducedMotion() ? 0 : curlAmount(leafProgress(position, index))
    if (Math.abs(bend - bent.current) < 1e-4) return
    bent.current = bend
    const columns = curlColumns(bend, length, COLUMNS, SPINE_GAP)
    const attribute = geometry.attributes.position!
    const array = attribute.array as Float32Array
    for (let i = 0; i < array.length; i += 3) {
      // Columna a la que pertenece el vértice, según su x en reposo.
      const u = (rest[i]! - SPINE_GAP) / length
      const column = columns[Math.round(u * (COLUMNS - 1))]!
      const offset = rest[i + 1]!
      array[i] = column.x - Math.sin(column.angle) * offset
      array[i + 1] = column.y + Math.cos(column.angle) * offset
    }
    attribute.needsUpdate = true
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
  })

  // Orden de materiales de BoxGeometry: +x, -x, +y, -y, +z, -z.
  const material = useMemo(() => {
    const side = paperMaterials(edge).face
    return [side, side, paperMaterials(front).face, paperMaterials(back).face, side, side]
  }, [front, back, edge])

  return (
    <group ref={pivot}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
    </group>
  )
}
