import { BookArrows, PliegoCanvas } from 'pliego'
import { DemoBook } from './DemoBook'

export function App() {
  return (
    <main className="app">
      <header className="title">
        <h1>Pliego</h1>
        <p>Motor de libros pop-up 3D · v0.3</p>
      </header>
      <PliegoCanvas className="canvas" aria-label="Un libro de cartulina sobre una mesa">
        <DemoBook />
      </PliegoCanvas>
      <BookArrows className="arrows" />
      <p className="hint">Usa las flechas, el teclado o arrastra la hoja</p>
    </main>
  )
}
