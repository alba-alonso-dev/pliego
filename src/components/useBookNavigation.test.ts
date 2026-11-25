import { describe, expect, it } from 'vitest'
import { pageAfterDrag } from './useBookNavigation'

describe('pageAfterDrag', () => {
  it('vuelve a su sitio si se arrastra poco y despacio', () => {
    expect(pageAfterDrag(2, 0.1, 0)).toBe(2)
    expect(pageAfterDrag(2, -0.1, 0)).toBe(2)
  })

  it('pasa la hoja si se arrastra lo suficiente', () => {
    expect(pageAfterDrag(2, 0.4, 0)).toBe(3)
    expect(pageAfterDrag(2, -0.4, 0)).toBe(1)
  })

  it('pasa la hoja con un gesto rápido aunque sea corto', () => {
    expect(pageAfterDrag(2, 0.05, 1.2)).toBe(3)
    expect(pageAfterDrag(2, -0.05, -1.2)).toBe(1)
  })
})
