import { useFrame } from '@react-three/fiber'
import { useContext, useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { spreadSurfaceY, spreadTheta } from '../math/book'
import { useBookStore } from '../store'
import { SpreadIndexContext, useBookContext } from './context'

/** Por debajo de este ángulo de apertura (grados) la escena no se dibuja. */
const HIDDEN_BELOW = 3

export interface SpreadProps {
  /** Identificador del spread; también es el `#hash` de su URL. */
  id: string
  /**
   * Grosor de la hoja que se pasa para salir de este spread (la que hay
   * bajo su página derecha). Con grosores distintos el bloque de hojas se
   * ve como capas, como en Estratos.
   */
  thickness?: number
  /** Color del canto de esa misma hoja: una franja en el corte del libro. */
  edgeColor?: string
  children?: ReactNode
}

/**
 * Lo que se ve con el libro abierto por una doble página.
 * Sus hijos se colocan con el lomo en x = 0: la página izquierda va de
 * x = -ancho a 0 y la derecha de 0 a ancho; en z, de -alto/2 (fondo) a
 * +alto/2 (frente). Las piezas que se levantan van dentro de <PopUp>.
 */
export function Spread({ children }: SpreadProps) {
  const index = useContext(SpreadIndexContext)
  if (index === null) throw new Error('<Spread> debe ser hijo directo de <Book>')
  const { count, thickness } = useBookContext()
  const group = useRef<Group>(null)

  useFrame(() => {
    if (!group.current) return
    const theta = spreadTheta(useBookStore.getState().position, index, count)
    group.current.visible = theta > HIDDEN_BELOW
  })

  return (
    <group ref={group} position={[0, spreadSurfaceY(index, count, thickness), 0]} visible={false}>
      {children}
    </group>
  )
}
