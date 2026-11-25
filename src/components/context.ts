import { createContext, useContext } from 'react'
import type { Thicknesses } from '../math/book'

export interface BookContextValue {
  /** Ancho y alto de una página. */
  size: [number, number]
  thickness: Thicknesses
  count: number
}

export const BookContext = createContext<BookContextValue | null>(null)

export function useBookContext(): BookContextValue {
  const value = useContext(BookContext)
  if (!value) throw new Error('Este componente debe ir dentro de <Book>')
  return value
}

export const SpreadIndexContext = createContext<number | null>(null)
