import { useFrame } from '@react-three/fiber'
import { useContext, useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { spreadSurfaceY, spreadTheta } from '../math/book'
import { clamp, easeOutCubic } from '../math/easing'
import { useBookStore } from '../store'
import { SpreadIndexContext, useBookContext } from './context'

/** Ángulo de apertura (grados) a partir del cual empieza a verse la escena. */
const OPEN_FROM = 150

export interface SpreadProps {
  /** Identificador del spread; también es el `#hash` de su URL. */
  id: string
  children?: ReactNode
}

/**
 * Lo que se ve con el libro abierto por una doble página.
 * Sus hijos se colocan con el lomo en x = 0: la página izquierda va de
 * x = -ancho a 0 y la derecha de 0 a ancho.
 *
 * En v0.1 la escena se aplana mientras el spread se cierra; el
 * despliegue pop-up de verdad llega con <PopUp> en v0.3.
 */
export function Spread({ children }: SpreadProps) {
  const index = useContext(SpreadIndexContext)
  if (index === null) throw new Error('<Spread> debe ser hijo directo de <Book>')
  const { count, thickness } = useBookContext()
  const group = useRef<Group>(null)

  useFrame(() => {
    const scene = group.current
    if (!scene) return
    const theta = spreadTheta(useBookStore.getState().position, index, count)
    // Provisional hasta <PopUp>: la escena solo se levanta en el último
    // tramo de la apertura, cuando ya están las dos páginas abajo.
    const rise = easeOutCubic(clamp((theta - OPEN_FROM) / (180 - OPEN_FROM)))
    scene.visible = rise > 0
    scene.scale.y = Math.max(rise, 0.001)
  })

  return (
    <group ref={group} position={[0, spreadSurfaceY(index, count, thickness), 0]} visible={false}>
      {children}
    </group>
  )
}

/** Ángulo de apertura del spread que contiene al componente (0–180). */
export function useSpreadTheta(): () => number {
  const index = useContext(SpreadIndexContext)
  const { count } = useBookContext()
  if (index === null) throw new Error('useSpreadTheta debe usarse dentro de <Spread>')
  return () => spreadTheta(useBookStore.getState().position, index, count)
}
