import { describe, expect, it } from 'vitest'
import * as pliego from './index'

describe('API pública', () => {
  it('exporta los hooks del bucle por spread que anuncia el CHANGELOG', () => {
    expect(typeof pliego.useSpreadFrame).toBe('function')
    expect(typeof pliego.useSpreadShown).toBe('function')
  })

  it('exporta los componentes principales', () => {
    for (const name of ['Book', 'Spread', 'PopUp', 'Paper', 'PliegoCanvas'] as const) {
      expect(typeof pliego[name]).toBe('function')
    }
  })
})
