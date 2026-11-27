import type { BufferGeometry } from 'three'

interface Entry {
  geometry: BufferGeometry
  users: number
}

const cache = new Map<string, Entry>()

/**
 * Geometrías compartidas: dos piezas con la misma forma y el mismo tamaño
 * usan la misma geometría. Se cuenta quién la usa y se libera al dejar de
 * usarse.
 */
export function acquireGeometry(key: string, build: () => BufferGeometry): BufferGeometry {
  const entry = cache.get(key)
  if (entry) {
    entry.users++
    return entry.geometry
  }
  const geometry = build()
  cache.set(key, { geometry, users: 1 })
  return geometry
}

export function releaseGeometry(key: string): void {
  const entry = cache.get(key)
  if (!entry) return
  entry.users--
  if (entry.users <= 0) {
    entry.geometry.dispose()
    cache.delete(key)
  }
}

/** Cuántas geometrías distintas hay ahora en uso (para pruebas). */
export function cachedGeometries(): number {
  return cache.size
}
