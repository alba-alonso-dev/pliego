import type { RootState } from '@react-three/fiber'
import { createContext, useContext, useEffect, useLayoutEffect, useRef } from 'react'

export type FrameCallback = (state: RootState, delta: number) => void

/** Bucle de un spread: reúne las actualizaciones de sus piezas. */
export interface SpreadFrameBus {
  add: (callback: { current: FrameCallback }) => () => void
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
