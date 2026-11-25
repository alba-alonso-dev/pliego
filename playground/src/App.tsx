import { PliegoCanvas } from 'pliego'
import { PaperCube } from './PaperCube'

export function App() {
  return (
    <main className="app">
      <header className="title">
        <h1>Pliego</h1>
        <p>Motor de libros pop-up 3D · v0.0</p>
      </header>
      <PliegoCanvas className="canvas" aria-label="Un cubo de papel girando sobre una mesa">
        <PaperCube />
      </PliegoCanvas>
    </main>
  )
}
