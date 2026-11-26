import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import { paperMaterials } from '../materials/paper'
import type { Vec2 } from '../math/parallel-fold'
import { DEFAULT_PAPER_DEPTH } from './Paper'

/** Largo por defecto de las pestañas de pegado. */
export const DEFAULT_TAB = 0.025

export interface FoldPanelProps {
  /** Extremos del panel en el plano del pliegue soporte. Se llama en cada fotograma. */
  ends: () => [Vec2, Vec2]
  /** Ancho del panel a lo largo de la bisagra. */
  width: number
  /** Centro del panel a lo largo de la bisagra. */
  z?: number
  color: string
  depth?: number
}

/**
 * Panel recto de cartulina entre dos puntos del plano del pliegue, con el
 * ancho dado a lo largo de la bisagra. Es la pieza básica de los
 * mecanismos de pliegue paralelo.
 */
export function FoldPanel({
  ends,
  width,
  z = 0,
  color,
  depth = DEFAULT_PAPER_DEPTH,
}: FoldPanelProps) {
  const mesh = useRef<Mesh>(null)
  const material = useMemo(() => {
    const { face, edge } = paperMaterials(color)
    // Orden de materiales de BoxGeometry: +x, -x, +y, -y, +z, -z.
    return [edge, edge, face, face, edge, edge]
  }, [color])

  useFrame(() => {
    if (!mesh.current) return
    const [[px, py], [qx, qy]] = ends()
    const length = Math.max(1e-5, Math.hypot(qx - px, qy - py))
    mesh.current.position.set((px + qx) / 2, (py + qy) / 2, z)
    mesh.current.rotation.z = Math.atan2(qy - py, qx - px)
    mesh.current.scale.set(length, depth, width)
  })

  return (
    <mesh ref={mesh} material={material} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  )
}
