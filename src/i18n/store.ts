import { create } from 'zustand'
import { idForPage, useBookStore } from '../store'
import { translate, type Dictionary } from './resolve'

interface I18nState {
  dictionaries: Record<string, Dictionary>
  fallback: string
}

/** Diccionarios cargados. El idioma activo vive en `useBookStore().lang`. */
export const useI18nStore = create<I18nState>(() => ({ dictionaries: {}, fallback: 'es' }))

/**
 * Textos en el idioma activo. `t(clave)` busca en el spread abierto (o en
 * el que se indique) y luego en los textos comunes.
 */
export function useT(): (key: string, spread?: string) => string {
  const lang = useBookStore((state) => state.lang)
  const current = useBookStore((state) => idForPage(state.ids, state.current))
  const { dictionaries, fallback } = useI18nStore()
  return (key, spread = current ?? undefined) => {
    const value = translate(dictionaries, lang ?? fallback, fallback, key, spread)
    return Array.isArray(value) ? value.join('\n\n') : value
  }
}

/** Como `useT`, pero devuelve listas tal cual (párrafos). */
export function useTexts(): (key: string, spread?: string) => string[] {
  const lang = useBookStore((state) => state.lang)
  const current = useBookStore((state) => idForPage(state.ids, state.current))
  const { dictionaries, fallback } = useI18nStore()
  return (key, spread = current ?? undefined) => {
    const value = translate(dictionaries, lang ?? fallback, fallback, key, spread)
    return Array.isArray(value) ? value : value === key ? [] : [value]
  }
}
