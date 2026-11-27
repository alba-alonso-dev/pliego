import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { qualityStep, type QualityState } from '../math/quality'
import { renderPending, requestRender, setInvalidate } from '../render-on-demand'
import { useBookStore } from '../store'

/** Segundos de fotogramas tras mover el ratón o el móvil, para que el parallax se asiente. */
const POINTER_SECONDS = 2

/**
 * Bucle bajo demanda: dibuja cuando cambia el libro, cuando se mueve el
 * ratón o el móvil (parallax) y mientras alguna pieza lo pide con
 * `requestRender`. Además mide la fluidez para la calidad adaptable.
 */
export function DemandLoop({ onDegrade }: { onDegrade?: (degraded: boolean) => void }) {
  const invalidate = useThree((state) => state.invalidate)
  const quality = useRef<QualityState>({ samples: [], degraded: false })

  useEffect(() => {
    setInvalidate(invalidate)
    requestRender(1)
    const unsubscribe = useBookStore.subscribe(() => requestRender(0.6))
    const onInput = () => requestRender(POINTER_SECONDS)
    const events = [
      'pointermove',
      'pointerdown',
      'wheel',
      'touchmove',
      'deviceorientation',
      'resize',
    ]
    events.forEach((name) => window.addEventListener(name, onInput, { passive: true }))
    return () => {
      setInvalidate(null)
      unsubscribe()
      events.forEach((name) => window.removeEventListener(name, onInput))
    }
  }, [invalidate])

  useFrame((_, delta) => {
    if (renderPending(performance.now())) invalidate()
    if (!onDegrade) return
    const next = qualityStep(quality.current, delta)
    if (next.degraded !== quality.current.degraded) onDegrade(next.degraded)
    quality.current = next
  })

  return null
}
