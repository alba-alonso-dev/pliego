import { describe, expect, it } from 'vitest'
import { baseLang, resolveLang, translate, type Dictionary } from './resolve'

describe('resolveLang', () => {
  const available = ['es', 'en']

  it('la URL manda sobre lo guardado y el navegador', () => {
    expect(resolveLang(available, { query: 'en', stored: 'es', browser: ['es-ES'] })).toBe('en')
  })

  it('si no, lo guardado; si no, el navegador', () => {
    expect(resolveLang(available, { stored: 'en', browser: ['es'] })).toBe('en')
    expect(resolveLang(available, { browser: ['fr-FR', 'en-GB'] })).toBe('en')
  })

  it('ignora idiomas no disponibles y usa el de reserva', () => {
    expect(resolveLang(available, { query: 'de', browser: ['fr'] })).toBe('es')
    expect(resolveLang(available, {}, 'en')).toBe('en')
  })

  it('reconoce variantes regionales', () => {
    expect(baseLang('es-ES')).toBe('es')
    expect(resolveLang(available, { query: 'EN-us' })).toBe('en')
  })
})

describe('translate', () => {
  const dictionaries: Record<string, Dictionary> = {
    es: { _: { siguiente: 'Siguiente' }, energia: { title: 'Energía' } },
    en: { energia: { title: 'Energy' } },
  }

  it('busca en el spread, luego en los comunes y luego en el idioma de reserva', () => {
    expect(translate(dictionaries, 'en', 'es', 'title', 'energia')).toBe('Energy')
    expect(translate(dictionaries, 'es', 'es', 'siguiente', 'energia')).toBe('Siguiente')
    expect(translate(dictionaries, 'en', 'es', 'siguiente')).toBe('Siguiente')
  })

  it('si no existe, devuelve la clave', () => {
    expect(translate(dictionaries, 'en', 'es', 'nada', 'energia')).toBe('nada')
  })
})
