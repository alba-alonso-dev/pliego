import { useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { pageFrame, spreadSurfaceY } from '../math/book'
import { curledPoint, pageCurl } from '../math/page-curl'
import { prefersReducedMotion } from '../motion'
import { useBookStore } from '../store'
import { useBookContext } from './context'
import { SPINE_GAP } from './Leaf'
import { useSpread } from './useSpread'
import { useSpreadFrame } from './spread-frame'

export interface OnPageProps {
  /** Página a la que va pegado el contenido. */
  side: 'left' | 'right'
  /** Altura extra sobre la superficie del papel. */
  lift?: number
  /**
   * Distancia al lomo (la `x` del spread) de lo que se pega. Si se da,
   * sigue la curva de la hoja al pasarla en ese punto; si no, se queda en
   * la parte rígida junto al lomo.
   */
  along?: number
  children?: ReactNode
}

/**
 * Pega a sus hijos sobre la superficie de una página del spread: con el
 * libro abierto quedan en su sitio y, al pasar la hoja, giran con ella (y
 * siguen su curva, si se indica `along`). Los hijos usan las coordenadas
 * del spread (lomo en x = 0, y = 0 sobre el papel).
 */
export function OnPage({ side, lift = 0, along, children }: OnPageProps) {
  const { size, count, thickness } = useBookContext()
  const { index } = useSpread()
  const frame = useRef<Group>(null)
  const curlGroup = useRef<Group>(null)
  const surface = useRef<Group>(null)
  // El grupo del spread ya está a la altura de la superficie abierta.
  const base = spreadSurfaceY(index, count, thickness)
  // Hoja de esta página: la izquierda es la hoja `index`; la derecha, la
  // siguiente (o la contratapa, que no se curva). La tapa tampoco se curva.
  const leaf = side === 'left' ? index : index + 1
  const curls = along !== undefined && leaf > 0 && leaf < count
  const length = size[0] - SPINE_GAP

  useSpreadFrame(() => {
    if (!frame.current || !surface.current || !curlGroup.current) return
    const position = useBookStore.getState().position
    const f = pageFrame(position, index, side, count, thickness)
    frame.current.position.y = f.y - base
    frame.current.rotation.z = f.rotation
    surface.current.position.y = f.surface + lift

    if (!curls) return
    const curl = pageCurl(position, index, side, count, prefersReducedMotion())
    const [cx, cy, angle] = curledPoint(along!, curl, length, SPINE_GAP)
    // Lleva el punto `along` a su sitio en la curva y gira lo que hay ahí.
    curlGroup.current.rotation.z = angle
    curlGroup.current.position.set(cx - Math.cos(angle) * along!, cy - Math.sin(angle) * along!, 0)
  })

  return (
    <group ref={frame}>
      <group ref={curlGroup}>
        <group ref={surface}>{children}</group>
      </group>
    </group>
  )
}
