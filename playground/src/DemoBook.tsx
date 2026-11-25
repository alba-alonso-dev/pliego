import { Book, Paper, Spread } from 'pliego'
import arbol from './shapes/arbol.svg?raw'
import casa from './shapes/casa.svg?raw'
import colina from './shapes/colina.svg?raw'
import molino from './shapes/molino.svg?raw'
import nube from './shapes/nube.svg?raw'

/** Libro de prueba: cuatro spreads con piezas de cartulina recortadas desde SVG. */
export function DemoBook() {
  return (
    <Book coverColor="#b5543c">
      <Spread id="bienvenida">
        <Paper src={colina} width={0.9} position={[-0.5, 0, 0.1]} color="#8ab17d" />
        <Paper src={arbol} height={0.45} position={[0.45, 0, 0]} color="#5b8e7d" />
        <Paper src={nube} width={0.3} position={[0.6, 0.45, -0.3]} color="#fbf7ee" />
      </Spread>
      <Spread id="colinas">
        <Paper src={colina} width={0.95} position={[-0.5, 0, -0.25]} color="#5b8e7d" />
        <Paper src={colina} width={0.8} position={[0.45, 0, 0]} color="#8ab17d" />
        <Paper src={molino} height={0.7} position={[0.3, 0, -0.3]} color="#fbf7ee" />
        <Paper src={arbol} height={0.3} position={[-0.3, 0, 0.25]} color="#3f6f5e" />
      </Spread>
      <Spread id="ciudad">
        <Paper src={casa} height={0.45} position={[-0.6, 0, 0]} color="#d98e6a" />
        <Paper src={casa} height={0.6} position={[-0.25, 0, -0.2]} color="#c0614b" />
        <Paper src={casa} height={0.5} position={[0.4, 0, 0.05]} color="#e9c46a" />
        <Paper src={arbol} height={0.35} position={[0.75, 0, 0.25]} color="#5b8e7d" />
      </Spread>
      <Spread id="final">
        <Paper src={colina} width={1.2} position={[0, 0, 0]} color="#5b8e7d" />
        <Paper src={nube} width={0.35} position={[-0.3, 0.4, -0.2]} color="#fbf7ee" />
      </Spread>
    </Book>
  )
}
