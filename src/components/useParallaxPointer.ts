import type { RootState } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { tiltToPointer } from '../math/parallax'
import { prefersReducedMotion } from '../motion'

/**
 * Puntero para el parallax, entre -1 y 1: la inclinación del móvil si el
 * navegador la da y, si no, la posición del ratón. Devuelve una función
 * que se llama dentro de `useFrame`; da [0, 0] si está desactivado o si la
 * persona prefiere reducir el movimiento.
 */
export function useParallaxPointer(enabled = true): (state: RootState) => [number, number] {
  const tilt = useRef<[number, number] | null>(null)
  const active = enabled && !prefersReducedMotion()

  // Giroscopio: solo donde el navegador lo da sin pedir permiso.
  useEffect(() => {
    if (!active) return
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return
      tilt.current = tiltToPointer(event.beta, event.gamma)
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [active])

  return (state) => (active ? (tilt.current ?? [state.pointer.x, state.pointer.y]) : [0, 0])
}
