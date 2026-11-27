/**
 * Redibujar solo cuando algo cambia. El lienzo de Pliego usa
 * `frameloop="demand"`: no se dibuja ningún fotograma si nada se mueve, lo
 * que ahorra batería en el móvil. Lo que se anima pide fotogramas mientras
 * dura con `requestRender(segundos)`.
 */

let deadline = 0
let invalidate: (() => void) | null = null

/** Lo llama el lienzo: la función que pide un fotograma nuevo. */
export function setInvalidate(fn: (() => void) | null): void {
  invalidate = fn
}

/** Pide fotogramas durante `seconds` segundos (como mínimo uno). */
export function requestRender(seconds = 0): void {
  const now = typeof performance === 'undefined' ? Date.now() : performance.now()
  deadline = Math.max(deadline, now + seconds * 1000)
  invalidate?.()
}

/** ¿Hay que seguir dibujando? Lo consulta el lienzo en cada fotograma. */
export function renderPending(now: number): boolean {
  return now < deadline
}
