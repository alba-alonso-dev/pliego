import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { leafProgress, pageFrame, spreadSurfaceY } from '../math/book'
import { curlAmount, curlAt } from '../math/curl'
import { prefersReducedMotion } from '../motion'
import { useBookStore } from '../store'
import { useBookContext } from './context'
import { SPINE_GAP } from './Leaf'
import { useSpread } from './useSpread'

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
  const curl = useRef<Group>(null)
  const surface = useRef<Group>(null)
  // El grupo del spread ya está a la altura de la superficie abierta.
  const base = spreadSurfaceY(index, count, thickness)
  // Hoja de esta página: la izquierda es la hoja `index`; la derecha, la
  // siguiente (o la contratapa, que no se curva). La tapa tampoco se curva.
  const leaf = side === 'left' ? index : index + 1
  const curls = along !== undefined && leaf > 0 && leaf < count
  const length = size[0] - SPINE_GAP

  useFrame(() => {
    if (!frame.current || !surface.current || !curl.current) return
    const position = useBookStore.getState().position
    const f = pageFrame(position, index, side, count, thickness)
    frame.current.position.y = f.y - base
    frame.current.rotation.z = f.rotation
    surface.current.position.y = f.surface + lift

    if (!curls) return
    const bend = prefersReducedMotion() ? 0 : curlAmount(leafProgress(position, leaf))
    // En la página izquierda el marco está girado media vuelta respecto a la hoja.
    const sign = side === 'left' ? -1 : 1
    const u = Math.abs(along!)
    const point = curlAt(bend, length, u - SPINE_GAP, SPINE_GAP)
    const angle = point.angle
    // Lleva el punto `along` a su sitio en la curva y gira lo que hay ahí.
    const rx = sign * u
    curl.current.rotation.z = angle
    curl.current.position.set(
      sign * point.x - Math.cos(angle) * rx,
      sign * point.y - Math.sin(angle) * rx,
      0,
    )
  })

  return (
    <group ref={frame}>
      <group ref={curl}>
        <group ref={surface}>{children}</group>
      </group>
    </group>
  )
}
