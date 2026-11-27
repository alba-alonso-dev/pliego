import { useContext, useMemo } from 'react'
import { spreadTheta } from '../math/book'
import { useBookStore } from '../store'
import { SpreadIndexContext, useBookContext } from './context'

export interface SpreadInfo {
  /** Posición del spread en el libro (0 = el primero). */
  index: number
  /** Ángulo de apertura actual en grados (0–180). Léelo dentro de useFrame. */
  theta: () => number
  /** ¿Es el spread abierto ahora (la página de destino)? */
  isOpen: () => boolean
}

/** Datos del spread que contiene al componente. */
export function useSpread(): SpreadInfo {
  const index = useContext(SpreadIndexContext)
  const { count } = useBookContext()
  if (index === null) throw new Error('useSpread debe usarse dentro de <Spread>')
  return useMemo(
    () => ({
      index,
      theta: () => spreadTheta(useBookStore.getState().position, index, count),
      isOpen: () => useBookStore.getState().current === index + 1,
    }),
    [index, count],
  )
}
