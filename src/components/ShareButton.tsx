import { useState } from 'react'
import { useBookStore } from '../store'

export interface ShareButtonProps {
  className?: string
  /** Título que se comparte (por defecto, el de la página). */
  title?: string
  /** Texto que acompaña al enlace. */
  text?: string
  labels?: { share: string; copied: string }
}

/** Enlace al spread abierto: la URL actual con su `#id` y su idioma. */
export function shareUrl(): string {
  return typeof window === 'undefined' ? '' : window.location.href
}

/**
 * Comparte el spread abierto con el menú de compartir del sistema (Web
 * Share API, en el móvil) o, si no lo hay, copia el enlace.
 */
export function ShareButton({
  className = 'pliego-share',
  title,
  text,
  labels = { share: 'Compartir', copied: 'Enlace copiado' },
}: ShareButtonProps) {
  // El enlace cambia con la página abierta; se lee al pulsar.
  useBookStore((state) => state.current)
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = shareUrl()
    const data = { title: title ?? document.title, text, url }
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        await navigator.share(data)
        return
      }
    } catch (error) {
      // Cancelar el menú de compartir no es un error.
      if ((error as DOMException)?.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(labels.share, url)
    }
  }

  return (
    <button type="button" className={className} onClick={share} aria-live="polite">
      {copied ? labels.copied : labels.share}
    </button>
  )
}
