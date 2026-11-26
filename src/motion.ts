const QUERY = '(prefers-reduced-motion: reduce)'

let query: MediaQueryList | null = null
let reduced = false

/**
 * ¿Ha pedido la persona reducir el movimiento en su sistema? Se consulta
 * muchas veces por fotograma, así que la respuesta se guarda y se
 * actualiza sola si cambia la preferencia.
 */
export function prefersReducedMotion(): boolean {
  if (query) return reduced
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  query = window.matchMedia(QUERY)
  reduced = query.matches
  query.addEventListener?.('change', (event) => {
    reduced = event.matches
  })
  return reduced
}
