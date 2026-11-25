import { PliegoCanvas, useBook } from 'pliego'
import { DemoBook } from './DemoBook'
export function App() {
  const { next, prev } = useBook()
  return (
    <main className="app">
      <header className="title">
        <h1>Pliego</h1>
        <p>Motor de libros pop-up 3D · v0.1</p>
      </header>
      <PliegoCanvas className="canvas" aria-label="Un libro de cartulina sobre una mesa">
        <DemoBook />
      </PliegoCanvas>
      <div className="arrows">
        <button type="button" onClick={prev}>
          ←
        </button>
        <button type="button" onClick={next}>
          →
        </button>
      </div>
    </main>
  )
}
