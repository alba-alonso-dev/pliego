import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { pageFrame, spreadSurfaceY } from '../math/book'
import { useBookStore } from '../store'
import { useBookContext } from './context'
import { useSpread } from './Spread'

export interface OnPageProps {
  /** Página a la que va pegado el contenido. */
  side: 'left' | 'right'
  /** Altura extra sobre la superficie del papel. */
  lift?: number
  children?: ReactNode
}

/**
 * Pega a sus hijos sobre la superficie de una página del spread: con el
 * libro abierto quedan en su sitio y, al pasar la hoja, giran con ella.
 * Los hijos usan las coordenadas del spread (lomo en x = 0, y = 0 sobre
 * el papel).
 */
export function OnPage({ side, lift = 0, children }: OnPageProps) {
  const { count, thickness } = useBookContext()
  const { index } = useSpread()
  const frame = useRef<Group>(null)
  const surface = useRef<Group>(null)
  // El grupo del spread ya está a la altura de la superficie abierta.
  const base = spreadSurfaceY(index, count, thickness)

  useFrame(() => {
    if (!frame.current || !surface.current) return
    const f = pageFrame(useBookStore.getState().position, index, side, count, thickness)
    frame.current.position.y = f.y - base
    frame.current.rotation.z = f.rotation
    surface.current.position.y = f.surface + lift
  })

  return (
    <group ref={frame}>
      <group ref={surface}>{children}</group>
    </group>
  )
}
