import { BufferGeometry } from 'three'
import { describe, expect, it, vi } from 'vitest'
import { acquireGeometry, cachedGeometries, releaseGeometry } from './geometry-cache'

describe('geometry-cache', () => {
  it('dos piezas iguales comparten geometría y se libera al soltar la última', () => {
    const build = vi.fn(() => new BufferGeometry())
    const a = acquireGeometry('casa|0.4', build)
    const b = acquireGeometry('casa|0.4', build)
    expect(a).toBe(b)
    expect(build).toHaveBeenCalledTimes(1)
    const dispose = vi.spyOn(a, 'dispose')
    releaseGeometry('casa|0.4')
    expect(dispose).not.toHaveBeenCalled()
    releaseGeometry('casa|0.4')
    expect(dispose).toHaveBeenCalled()
    expect(cachedGeometries()).toBe(0)
  })

  it('formas o tamaños distintos no se mezclan', () => {
    const a = acquireGeometry('casa|0.4', () => new BufferGeometry())
    const b = acquireGeometry('casa|0.5', () => new BufferGeometry())
    expect(a).not.toBe(b)
    releaseGeometry('casa|0.4')
    releaseGeometry('casa|0.5')
  })
})
