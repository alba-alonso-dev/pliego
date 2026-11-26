const warned = new Set<string>()

/**
 * Avisa una sola vez por consola de un problema de diseño (por ejemplo, un
 * mecanismo que no se plegaría en papel de verdad).
 */
export function warnOnce(message: string): void {
  if (warned.has(message)) return
  warned.add(message)
  console.warn(`[pliego] ${message}`)
}
