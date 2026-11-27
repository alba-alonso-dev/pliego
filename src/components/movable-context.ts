import { createContext, useContext } from 'react'
import type { Gesture } from './useGesture'

/** Gesto del movible (lengüeta, rueda o solapa) que contiene al componente. */
export const MovableContext = createContext<Gesture | null>(null)

/** Progreso del movible que contiene al componente (0–1). Léelo en `useFrame`. */
export function useMovable(): () => number {
  const gesture = useContext(MovableContext)
  if (!gesture) throw new Error('useMovable debe usarse dentro de <PullTab>, <Volvelle> o <Flap>')
  return gesture.progress
}
