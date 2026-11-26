// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { playPaper, soundShape, useSoundStore } from './sound'

describe('soundShape', () => {
  it('pasar la hoja suena más largo que mover una pieza', () => {
    expect(soundShape('turn').duration).toBeGreaterThan(soundShape('flap').duration)
    expect(soundShape('turn').duration).toBeGreaterThan(soundShape('slide').duration)
  })

  it('solo la solapa tiene golpe grave', () => {
    expect(soundShape('flap').thump).toBeGreaterThan(0)
    expect(soundShape('turn').thump).toBe(0)
  })
})

describe('useSoundStore', () => {
  it('está apagado por defecto y recuerda la preferencia', () => {
    expect(useSoundStore.getState().enabled).toBe(false)
    useSoundStore.getState().setEnabled(true)
    expect(window.localStorage.getItem('pliego:sound')).toBe('on')
    useSoundStore.getState().setEnabled(false)
    expect(window.localStorage.getItem('pliego:sound')).toBe('off')
  })

  it('apagado no intenta sonar', () => {
    expect(() => playPaper('turn')).not.toThrow()
  })
})
