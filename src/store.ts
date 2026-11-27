import { create } from 'zustand'
import { clamp } from './math/easing'

export interface BookState {
  /** Ids de los spreads, en orden. */
  ids: string[]
  /** Hojas pasadas (destino): 0 = cerrado, `ids.length` = último spread. */
  current: number
  /** Posición continua que se anima hacia `current` (ver math/book.ts). */
  position: number
  /** Hay una hoja moviéndose (animación o arrastre). */
  turning: boolean
  /** Idioma activo, o null si el libro no tiene textos todavía. */
  lang: string | null
  /** Dónde está la bisagra: a la izquierda (libro) o arriba (bloc, Estratos). */
  hinge: 'left' | 'top'
  /** Ancho y fondo del libro abierto en la mesa, para que la cámara lo encuadre. */
  footprint: [number, number] | null

  setIds: (ids: string[]) => void
  goTo: (page: number) => void
  goToId: (id: string) => void
  next: () => void
  prev: () => void
  setPosition: (position: number, turning: boolean) => void
  setLang: (lang: string) => void
  setHinge: (hinge: 'left' | 'top') => void
  setFootprint: (footprint: [number, number]) => void
}

/** Página (hojas pasadas) que abre el spread con ese id, o null si no existe. */
export function pageForId(ids: string[], id: string): number | null {
  const index = ids.indexOf(id)
  return index === -1 ? null : index + 1
}

/** Id del spread abierto en esa página, o null si el libro está cerrado. */
export function idForPage(ids: string[], page: number): string | null {
  return page > 0 ? (ids[page - 1] ?? null) : null
}

export const useBookStore = create<BookState>()((set, get) => ({
  ids: [],
  current: 0,
  position: 0,
  turning: false,
  lang: null,
  hinge: 'left',
  footprint: null,

  setIds: (ids) => {
    const current = Math.min(get().current, ids.length)
    set({ ids, current, position: Math.min(get().position, ids.length) })
  },
  goTo: (page) => set({ current: Math.round(clamp(page, 0, get().ids.length)) }),
  goToId: (id) => {
    const page = pageForId(get().ids, id)
    if (page !== null) get().goTo(page)
  },
  next: () => get().goTo(get().current + 1),
  prev: () => get().goTo(get().current - 1),
  setPosition: (position, turning) => set({ position, turning }),
  setLang: (lang) => set({ lang }),
  setHinge: (hinge) => set({ hinge }),
  setFootprint: (footprint) => set({ footprint }),
}))

/** Estado y acciones del libro para usar en componentes. */
export function useBook() {
  const current = useBookStore((s) => s.current)
  const count = useBookStore((s) => s.ids.length)
  const turning = useBookStore((s) => s.turning)
  const next = useBookStore((s) => s.next)
  const prev = useBookStore((s) => s.prev)
  const goTo = useBookStore((s) => s.goTo)
  const goToId = useBookStore((s) => s.goToId)
  return {
    current,
    count,
    turning,
    isClosed: current === 0,
    isFirst: current === 0,
    isLast: current === count,
    next,
    prev,
    goTo,
    goToId,
  }
}
