import {
  BookArrows,
  LanguageSwitcher,
  Languages,
  MovableControls,
  PliegoCanvas,
  useT,
} from 'pliego'
import { DemoBook } from './DemoBook'
import { en } from './locales/en'
import { es } from './locales/es'

const dictionaries = { es, en }

export function App() {
  return (
    <main className="app">
      <Languages dictionaries={dictionaries} fallback="es" />
      <header className="title">
        <h1>Pliego</h1>
        <p>Motor de libros pop-up 3D · v0.5</p>
      </header>
      <PliegoCanvas className="canvas" aria-label="Un libro de cartulina sobre una mesa">
        <DemoBook />
      </PliegoCanvas>
      <BookArrows className="arrows" />
      <LanguageSwitcher className="languages" />
      <MovableControls className="movables" />
      <Hint />
    </main>
  )
}

/** Pista de uso en el idioma activo. */
function Hint() {
  const t = useT()
  return <p className="hint">{t('hint', '_')}</p>
}
