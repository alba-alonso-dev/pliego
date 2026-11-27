import { useTexts, useT } from '../i18n/store'
import { useBookStore } from '../store'

export interface PageTextProps {
  className?: string
  /** Clave del título en el diccionario de cada spread. */
  titleKey?: string
  /** Clave del texto (uno o varios párrafos). */
  textKey?: string
}

/**
 * Texto del spread abierto en HTML, fuera del lienzo y en el idioma
 * activo: lo leen los lectores de pantalla y los buscadores, y se puede
 * seleccionar y traducir. Con el libro cerrado muestra los textos comunes
 * (`_`) de las mismas claves, si los hay.
 */
export function PageText({
  className = 'pliego-text',
  titleKey = 'title',
  textKey = 'text',
}: PageTextProps) {
  const current = useBookStore((state) => state.current)
  const id = useBookStore((state) => (state.current > 0 ? state.ids[state.current - 1] : '_'))
  const t = useT()
  const texts = useTexts()
  const title = t(titleKey, id)
  const paragraphs = texts(textKey, id)
  const hasTitle = title !== titleKey

  if (!hasTitle && paragraphs.length === 0) return null
  return (
    <section className={className} aria-live="polite" data-spread={current}>
      {hasTitle && <h2>{title}</h2>}
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </section>
  )
}
