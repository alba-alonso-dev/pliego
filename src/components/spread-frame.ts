import type { RootState } from '@react-three/fiber'
import { createContext, useContext, useEffect, useLayoutEffect, useRef } from 'react'

export type FrameCallback = (state: RootState, delta: number) => void

/** Bucle de un spread: reúne las actualizaciones de sus piezas. */
export interface SpreadFrameBus {
  add: (callback: { current: FrameCallback }) => () => void
  /** Cuántas veces ha vuelto a verse el spread: cambia cada vez que reaparece. */
  shown: () => number
}

export const SpreadFrameContext = createContext<SpreadFrameBus | null>(null)

/**
 * Como `useFrame`, pero dentro de un `<Spread>`: el spread ejecuta todas
 * las actualizaciones de sus piezas en un solo bucle y se las salta
 * mientras no se ve. Así un libro con muchas piezas no hace trabajo de más
 * en cada fotograma.
 */
export function useSpreadFrame(callback: FrameCallback): void {
  const bus = useContext(SpreadFrameContext)
  if (!bus) throw new Error('useSpreadFrame debe usarse dentro de <Spread>')
  const ref = useRef(callback)
  useLayoutEffect(() => {
    ref.current = callback
  })
  useEffect(() => bus.add(ref), [bus])
}

/** Contador que cambia cada vez que el spread vuelve a verse (para reiniciar animaciones). */
export function useSpreadShown(): () => number {
  const bus = useContext(SpreadFrameContext)
  if (!bus) throw new Error('useSpreadShown debe usarse dentro de <Spread>')
  return bus.shown
}
