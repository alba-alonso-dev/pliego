import { beforeEach, describe, expect, it } from 'vitest'
import { idForPage, pageForId, useBookStore } from './store'

const store = () => useBookStore.getState()

beforeEach(() => {
  useBookStore.setState({ ids: [], current: 0, position: 0, turning: false, lang: null })
  store().setIds(['tapa', 'energia', 'comida'])
})

describe('navegación', () => {
  it('empieza cerrado', () => {
    expect(store().current).toBe(0)
  })

  it('next y prev avanzan y retroceden una hoja', () => {
    store().next()
    store().next()
    expect(store().current).toBe(2)
    store().prev()
    expect(store().current).toBe(1)
  })

  it('no se sale de los límites', () => {
    store().prev()
    expect(store().current).toBe(0)
    store().goTo(99)
    expect(store().current).toBe(3)
    store().next()
    expect(store().current).toBe(3)
  })

  it('goToId abre el spread por su id', () => {
    store().goToId('comida')
    expect(store().current).toBe(3)
    store().goToId('no-existe')
    expect(store().current).toBe(3)
  })

  it('al quitar spreads ajusta la página actual', () => {
    store().goTo(3)
    store().setIds(['tapa'])
    expect(store().current).toBe(1)
  })
})

describe('ids y páginas', () => {
  const ids = ['a', 'b']

  it('pageForId e idForPage son inversas', () => {
    expect(pageForId(ids, 'b')).toBe(2)
    expect(idForPage(ids, 2)).toBe('b')
    expect(idForPage(ids, 0)).toBeNull()
    expect(pageForId(ids, 'x')).toBeNull()
  })
})
