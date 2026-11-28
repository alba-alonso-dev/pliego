import {
  BookArrows,
  LanguageSwitcher,
  Languages,
  LoadingScreen,
  MovableControls,
  PageText,
  PliegoCanvas,
  ShareButton,
  SoundToggle,
  useT,
} from 'pliego'
import { DemoBook } from './DemoBook'
import { EstratosBook } from './EstratosBook'
import { en } from './locales/en'
import { es } from './locales/es'

const dictionaries = { es, en }

/** `?libro=estratos` abre el libro de prueba con la bisagra arriba. */
const estratos = new URLSearchParams(window.location.search).get('libro') === 'estratos'

export function App() {
  const t = useT()
  return (
    <main className="app">
      <Languages dictionaries={dictionaries} fallback="es" />
      <header className="title">
        <h1>Pliego</h1>
        <p>Motor de libros pop-up 3D · v1.3</p>
      </header>
      <PliegoCanvas
        className="canvas"
        // Estratos se mira algo más de frente, para ver el corte de capas.
        cameraPosition={estratos ? [0, 1.9, 2.7] : undefined}
        aria-label={t('canvas', '_')}
      >
        {estratos ? <EstratosBook /> : <DemoBook />}
      </PliegoCanvas>
      <Arrows />
      <PageText className="page-text" />
      <Loading />
      <LanguageSwitcher className="languages" />
      <Sound />
      <Share />
      <Movables />
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

/** Botón de sonido con el texto en el idioma activo. */
function Sound() {
  const t = useT()
  return (
    <SoundToggle className="sound" labels={{ on: t('soundOn', '_'), off: t('soundOff', '_') }} />
  )
}

/** Compartir el spread abierto, con el texto en el idioma activo. */
function Share() {
  const t = useT()
  return (
    <ShareButton className="share" labels={{ share: t('share', '_'), copied: t('copied', '_') }} />
  )
}

/** Flechas y controles de los movibles con sus nombres accesibles traducidos. */
function Arrows() {
  const t = useT()
  return (
    <BookArrows
      className="arrows"
      labels={{ prev: t('prev', '_'), next: t('next', '_') }}
      navLabel={t('nav', '_')}
    />
  )
}

function Movables() {
  const t = useT()
  return <MovableControls className="movables" label={t('movables', '_')} />
}
