/**
 * Cerrojo compartido entre gestos: mientras alguien arrastra una pieza
 * interactiva, el arrastre de página no debe pasar la hoja.
 */
let locked = 0

export function lockGesture(): void {
  locked++
}

export function unlockGesture(): void {
  locked = Math.max(0, locked - 1)
}

export function isGestureLocked(): boolean {
  return locked > 0
}
