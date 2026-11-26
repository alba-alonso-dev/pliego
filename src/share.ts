/** Enlace al spread abierto: la URL actual con su `#id` y su idioma. */
export function shareUrl(): string {
  return typeof window === 'undefined' ? '' : window.location.href
}
