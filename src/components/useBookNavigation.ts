import { useThree } from '@react-three/fiber'
import { useDrag } from '@use-gesture/react'
import { useEffect } from 'react'
import { clamp } from '../math/easing'
import { idForPage, pageForId, useBookStore } from '../store'
import { animateTo, stopTurn } from '../turn'

export interface NavigationOptions {
  /** Pasar página con ← → (y Inicio / Fin). */
  keyboard?: boolean
  /** Sincronizar el spread abierto con `#id` en la URL. */
  hash?: boolean
  /** Arrastrar con ratón o dedo para pasar la hoja. */
  drag?: boolean
}

/** Fracción del ancho del lienzo que hay que arrastrar para pasar una hoja entera. */
const DRAG_WIDTH = 0.45
/** A partir de qué fracción de hoja arrastrada se completa el giro al soltar. */
const DRAG_THRESHOLD = 0.25

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/**
 * Página a la que se llega al soltar un arrastre. Pura, para poder testearla.
 * `dragged` es la fracción de hoja arrastrada (positiva hacia delante) y
 * `velocity` la rapidez del gesto al soltar.
 */
export function pageAfterDrag(current: number, dragged: number, velocity: number): number {
  const flick = Math.abs(velocity) > 0.5 ? Math.sign(dragged) : 0
  if (flick !== 0 || Math.abs(dragged) >= DRAG_THRESHOLD) {
    return current + Math.sign(flick || dragged)
  }
  return current
}

export function useBookNavigation({
  keyboard = true,
  hash = true,
  drag = true,
}: NavigationOptions): void {
  const element = useThree((state) => state.gl.domElement)

  // Teclado.
  useEffect(() => {
    if (!keyboard) return
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      if (isTyping(event.target)) return
      const { next, prev, goTo, ids } = useBookStore.getState()
      const actions: Record<string, () => void> = {
        ArrowRight: next,
        PageDown: next,
        ArrowLeft: prev,
        PageUp: prev,
        Home: () => goTo(0),
        End: () => goTo(ids.length),
      }
      const action = actions[event.key]
      if (action) {
        event.preventDefault()
        action()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keyboard])

  // Hash en la URL: al cargar, al cambiarlo a mano y al pasar página.
  useEffect(() => {
    if (!hash) return
    const openFromHash = (instant: boolean) => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      const { ids, goTo, setPosition } = useBookStore.getState()
      const page = id ? pageForId(ids, id) : 0
      if (page === null) return
      if (instant) setPosition(page, false)
      goTo(page)
    }
    // Esperar a que <Book> registre los ids antes de leer el hash inicial.
    let opened = false
    const unsubscribeIds = useBookStore.subscribe((state) => {
      if (!opened && state.ids.length > 0) {
        opened = true
        openFromHash(true)
      }
    })
    if (useBookStore.getState().ids.length > 0) {
      opened = true
      openFromHash(true)
    }
    const unsubscribePage = useBookStore.subscribe((state, previous) => {
      if (state.current === previous.current) return
      const id = idForPage(state.ids, state.current)
      const url = new URL(window.location.href)
      url.hash = id ? `#${encodeURIComponent(id)}` : ''
      if (url.href !== window.location.href) window.history.replaceState(null, '', url)
    })
    const onHashChange = () => openFromHash(false)
    window.addEventListener('hashchange', onHashChange)
    return () => {
      unsubscribeIds()
      unsubscribePage()
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [hash])

  // Arrastre: la hoja sigue al dedo y al soltar se completa o vuelve.
  useEffect(() => {
    if (drag) element.style.touchAction = 'pan-y'
  }, [drag, element])

  useDrag(
    ({ first, last, movement: [mx], velocity: [vx], tap, memo }) => {
      if (tap) return memo
      const { current, position, ids, setPosition, goTo } = useBookStore.getState()
      // El arrastre parte de donde esté la hoja, aunque estuviera girando.
      if (first) stopTurn()
      const start: number = first ? position : (memo ?? position)
      const dragged = clamp(-mx / (element.clientWidth * DRAG_WIDTH), -1, 1)
      if (!last) {
        setPosition(clamp(start + dragged, 0, ids.length), true)
        return start
      }
      const from = Math.round(start)
      const target = clamp(pageAfterDrag(from, dragged, vx), 0, ids.length)
      if (target === current) animateTo(current)
      else goTo(target)
      return start
    },
    { target: element, enabled: drag, axis: 'x', filterTaps: true, pointer: { touch: true } },
  )
}
