import { create } from 'zustand'

/** Un movible de la página, para poder manejarlo también desde HTML. */
export interface MovableEntry {
  id: string
  /** Spread en el que está (0 = el primero). */
  spread: number
  /** Texto accesible del control. */
  label: string
  /** `toggle` = botón (solapa); `range` = deslizador (lengüeta, rueda). */
  kind: 'toggle' | 'range'
  progress: () => number
  set: (value: number) => void
  toggle: () => void
}

interface MovablesState {
  entries: MovableEntry[]
  register: (entry: MovableEntry) => () => void
}

/** Registro de los movibles montados, para `<MovableControls>`. */
export const useMovablesStore = create<MovablesState>((set) => ({
  entries: [],
  register: (entry) => {
    set((state) => ({ entries: [...state.entries.filter((e) => e.id !== entry.id), entry] }))
    return () => set((state) => ({ entries: state.entries.filter((e) => e.id !== entry.id) }))
  },
}))
