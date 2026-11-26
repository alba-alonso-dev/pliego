import {
  BookArrows,
  LanguageSwitcher,
  Languages,
  LoadingScreen,
  MovableControls,
  PageText,
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
        <p>Motor de libros pop-up 3D · v0.6</p>
      </header>
      <PliegoCanvas className="canvas" aria-label="Un libro de cartulina sobre una mesa">
        <DemoBook />
      </PliegoCanvas>
      <BookArrows className="arrows" />
      <PageText className="page-text" />
      <Loading />
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

/** Pantalla de carga con el texto en el idioma activo. */
function Loading() {
  const t = useT()
  return <LoadingScreen className="loading" label={t('loading', '_')} />
}
