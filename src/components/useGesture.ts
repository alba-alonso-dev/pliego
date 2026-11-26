import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { lockGesture, unlockGesture } from '../gesture-lock'
import { clamp } from '../math/easing'
import { approach, dragProgress, holdStep } from '../math/gesture'
import { prefersReducedMotion } from '../motion'

export interface GestureOptions {
  /**
   * Cómo se controla: `drag` (arrastrar), `hold` (mantener pulsado) o
   * `click` (cada clic alterna entre 0 y 1).
   */
  mode?: 'drag' | 'hold' | 'click'
  /** Eje del arrastre: `x` (a la derecha sube) o `y` (hacia arriba sube). */
  axis?: 'x' | 'y'
  /** Píxeles de arrastre para recorrer todo el rango. */
  distance?: number
  /** Segundos para recorrer todo el rango al mantener o tras un clic. */
  duration?: number
  /** Al soltar en modo `hold`: se queda donde esté o vuelve a 0. */
  release?: 'stay' | 'return'
  /** Progreso inicial. */
  initial?: number
}

type PointerHandler = (event: ThreeEvent<PointerEvent>) => void

export interface Gesture {
  /** Progreso actual (0–1). Léelo dentro de `useFrame`. */
  progress: () => number
  /** Fija el progreso (para controles HTML o el teclado). */
  set: (value: number) => void
  /** Alterna entre 0 y 1, con animación si el modo lo pide. */
  toggle: () => void
  /** Props para el objeto 3D que recibe el gesto: `<mesh {...gesture.bind}>`. */
  bind: {
    onPointerDown: PointerHandler
    onPointerMove: PointerHandler
    onPointerUp: PointerHandler
    onPointerCancel: PointerHandler
    onPointerOver: PointerHandler
    onPointerOut: PointerHandler
  }
}

/**
 * Convierte un gesto sobre un objeto 3D en un progreso de 0 a 1 que se
 * puede usar para animar cualquier cosa. Mientras dura el gesto, el
 * arrastre de página queda en pausa para no pasar la hoja sin querer.
 *
 * ```tsx
 * const sun = useGesture({ mode: 'drag', axis: 'y' })
 * useFrame(() => { pieza.current.scale.setScalar(0.5 + sun.progress()) })
 * return <mesh {...sun.bind}>…</mesh>
 * ```
 */
export function useGesture({
  mode = 'drag',
  axis = 'y',
  distance = 220,
  duration = 1.2,
  release = 'stay',
  initial = 0,
}: GestureOptions = {}): Gesture {
  const progress = useRef(clamp(initial))
  const target = useRef(clamp(initial))
  const holding = useRef(false)
  const grab = useRef<{ x: number; y: number; start: number } | null>(null)
  const locked = useRef(false)

  const release_ = () => {
    holding.current = false
    grab.current = null
    if (locked.current) {
      locked.current = false
      unlockGesture()
    }
  }
  // Si el componente desaparece en mitad de un gesto, soltar el cerrojo.
  useEffect(() => release_, [])

  useFrame((_, delta) => {
    const time = prefersReducedMotion() ? 0 : duration
    if (mode === 'hold') {
      progress.current = holdStep(progress.current, delta, time, holding.current, release)
    } else if (mode === 'click') {
      progress.current = approach(progress.current, target.current, delta, time)
    }
  })

  return useMemo<Gesture>(() => {
    const capture = (event: ThreeEvent<PointerEvent>) => {
      const element = event.target as unknown as Element | null
      element?.setPointerCapture?.(event.pointerId)
    }
    return {
      progress: () => progress.current,
      set: (value) => {
        progress.current = clamp(value)
        target.current = progress.current
      },
      toggle: () => {
        target.current = target.current > 0.5 ? 0 : 1
        if (mode !== 'click') progress.current = target.current
      },
      bind: {
        onPointerDown: (event) => {
          event.stopPropagation()
          capture(event)
          if (!locked.current) {
            locked.current = true
            lockGesture()
          }
          if (mode === 'click') {
            target.current = target.current > 0.5 ? 0 : 1
            return
          }
          holding.current = true
          grab.current = { x: event.clientX, y: event.clientY, start: progress.current }
        },
        onPointerMove: (event) => {
          if (mode !== 'drag' || !grab.current) return
          event.stopPropagation()
          const moved =
            axis === 'x' ? event.clientX - grab.current.x : grab.current.y - event.clientY
          progress.current = dragProgress(grab.current.start, moved, distance)
          target.current = progress.current
        },
        onPointerUp: () => release_(),
        onPointerCancel: () => release_(),
        onPointerOver: () => {
          document.body.style.cursor = mode === 'drag' ? 'grab' : 'pointer'
        },
        onPointerOut: () => {
          document.body.style.cursor = ''
        },
      },
    }
  }, [mode, axis, distance])
}
