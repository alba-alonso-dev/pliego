/**
 * Elección del idioma: el de la URL (`?lang=`), si no el guardado, si no el
 * del navegador y, si ninguno está disponible, el de reserva.
 */
export interface LangSources {
  query?: string | null
  stored?: string | null
  /** Idiomas del navegador por orden de preferencia (`navigator.languages`). */
  browser?: readonly string[]
}

/** Normaliza una etiqueta de idioma a su código corto: `es-ES` → `es`. */
export function baseLang(tag: string): string {
  return tag.toLowerCase().split(/[-_]/)[0] ?? ''
}

export function resolveLang(
  available: readonly string[],
  sources: LangSources,
  fallback = available[0] ?? 'es',
): string {
  const pick = (tag: string | null | undefined) => {
    if (!tag) return null
    const exact = available.find((lang) => lang.toLowerCase() === tag.toLowerCase())
    if (exact) return exact
    const base = baseLang(tag)
    return available.find((lang) => baseLang(lang) === base) ?? null
  }
  return (
    pick(sources.query) ??
    pick(sources.stored) ??
    (sources.browser ?? []).map(pick).find((lang) => lang !== null) ??
    fallback
  )
}

/** Textos de un idioma: por spread (`id` del `<Spread>`) y, en `_`, los comunes. */
export type Dictionary = Record<string, Record<string, string | string[]>>

/**
 * Busca un texto: primero en el spread, luego en los comunes (`_`) y
 * luego en el idioma de reserva. Si no existe, devuelve la clave.
 */
export function translate(
  dictionaries: Record<string, Dictionary>,
  lang: string,
  fallback: string,
  key: string,
  spread?: string,
): string | string[] {
  for (const l of [lang, fallback]) {
    const dict = dictionaries[l]
    if (!dict) continue
    const value = (spread !== undefined ? dict[spread]?.[key] : undefined) ?? dict._?.[key]
    if (value !== undefined) return value
  }
  return key
}
