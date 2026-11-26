import { useEffect } from 'react'
import { create } from 'zustand'
import { idForPage, useBookStore } from '../store'
import { resolveLang, translate, type Dictionary } from './resolve'

const STORAGE_KEY = 'pliego:lang'

interface I18nState {
  dictionaries: Record<string, Dictionary>
  fallback: string
}

/** Diccionarios cargados. El idioma activo vive en `useBookStore().lang`. */
export const useI18nStore = create<I18nState>(() => ({ dictionaries: {}, fallback: 'es' }))

export interface LanguagesProps {
  /**
   * Un diccionario por idioma, con los textos de cada spread (por su `id`)
   * y los comunes en `_`. Añadir un idioma es añadir una entrada.
   */
  dictionaries: Record<string, Dictionary>
  /** Idioma de reserva cuando falta un texto o no hay otro disponible. */
  fallback?: string
}

/**
 * Activa los idiomas del libro: elige el inicial (URL `?lang=`, el guardado
 * o el del navegador) y, al cambiarlo, lo guarda, lo pone en la URL y en
 * `<html lang>` para los lectores de pantalla. No dibuja nada.
 */
export function Languages({ dictionaries, fallback }: LanguagesProps) {
  const available = Object.keys(dictionaries)
  const reserve = fallback ?? available[0] ?? 'es'

  useEffect(() => {
    useI18nStore.setState({ dictionaries, fallback: reserve })
  }, [dictionaries, reserve])

  // Idioma inicial.
  useEffect(() => {
    if (available.length === 0) return
    const params = new URLSearchParams(window.location.search)
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      // Sin acceso a localStorage (modo privado estricto): se ignora.
    }
    const lang = resolveLang(
      available,
      { query: params.get('lang'), stored, browser: navigator.languages },
      reserve,
    )
    useBookStore.getState().setLang(lang)
    document.documentElement.lang = lang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available.join('|'), reserve])

  // Al cambiar de idioma: <html lang>, almacenamiento y URL.
  useEffect(
    () =>
      useBookStore.subscribe((state, previous) => {
        if (!state.lang || state.lang === previous.lang) return
        document.documentElement.lang = state.lang
        try {
          window.localStorage.setItem(STORAGE_KEY, state.lang)
        } catch {
          // Se ignora si no se puede guardar.
        }
        const url = new URL(window.location.href)
        url.searchParams.set('lang', state.lang)
        window.history.replaceState(null, '', url)
      }),
    [],
  )

  return null
}

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

export interface LanguageSwitcherProps {
  className?: string
}

/** Botones para cambiar de idioma, con el nombre de cada uno en su lengua. */
export function LanguageSwitcher({ className = 'pliego-languages' }: LanguageSwitcherProps) {
  const lang = useBookStore((state) => state.lang)
  const setLang = useBookStore((state) => state.setLang)
  const available = Object.keys(useI18nStore((state) => state.dictionaries))
  if (available.length < 2) return null
  const nameOf = (code: string) => {
    try {
      return new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code
    } catch {
      return code
    }
  }
  return (
    <div className={className} role="group" aria-label="Idioma / Language">
      {available.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={code === lang}
          onClick={() => setLang(code)}
        >
          {nameOf(code)}
        </button>
      ))}
    </div>
  )
}
