import { useFrame } from '@react-three/fiber'
import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { DEFAULT_PAPER_DEPTH } from './Paper'
import { OnPage } from './OnPage'
import { useSpread } from './Spread'

/**
 * Pliegue soporte de un mecanismo: dos planos unidos por una bisagra que
 * va por el eje Z del grupo actual. El soporte derecho va por +X y el
 * izquierdo forma un ángulo `theta()` (radianes) con él, hacia +Y.
 */
export interface FoldSupport {
  theta: () => number
}

const FoldContext = createContext<FoldSupport | null>(null)

/** El pliegue soporte en el que está montado el componente. */
export function useFoldSupport(): FoldSupport {
  const support = useContext(FoldContext)
  if (!support) throw new Error('Este mecanismo debe ir dentro de un <Spread> o de otro mecanismo')
  return support
}

/**
 * Monta un mecanismo: si ya está dentro de otro, usa su pliegue; si no,
 * usa el lomo del spread, pegado a la página derecha.
 */
export function MechanismRoot({ children }: { children?: ReactNode }) {
  const parent = useContext(FoldContext)
  if (parent) return <>{children}</>
  return <SpreadFold>{children}</SpreadFold>
}

function SpreadFold({ children }: { children?: ReactNode }) {
  const { theta } = useSpread()
  const support = useMemo<FoldSupport>(() => ({ theta: () => (theta() * Math.PI) / 180 }), [theta])
  return (
    // Medio grosor de cartulina para que las piezas tumbadas no atraviesen la página.
    <OnPage side="right" lift={DEFAULT_PAPER_DEPTH / 2}>
      <FoldContext.Provider value={support}>{children}</FoldContext.Provider>
    </OnPage>
  )
}

export interface FoldFrameProps {
  /**
   * Dónde está el pliegue en el plano del soporte padre y cómo está girado:
   * `[x, y, giro]`. Se llama en cada fotograma.
   */
  pose: () => [number, number, number]
  /** Apertura del nuevo pliegue (radianes). */
  theta: () => number
  /** Desplazamiento a lo largo de la bisagra. */
  z?: number
  children?: ReactNode
}

/** Crea un pliegue soporte nuevo sobre una pieza, para montar capas. */
export function FoldFrame({ pose, theta, z = 0, children }: FoldFrameProps) {
  const group = useRef<Group>(null)
  const support = useMemo<FoldSupport>(() => ({ theta }), [theta])
  useFrame(() => {
    if (!group.current) return
    const [x, y, rotation] = pose()
    group.current.position.set(x, y, z)
    group.current.rotation.z = rotation
  })
  return (
    <group ref={group}>
      <FoldContext.Provider value={support}>{children}</FoldContext.Provider>
    </group>
  )
}
