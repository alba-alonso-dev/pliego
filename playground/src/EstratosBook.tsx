import { Book, Paper, PopUp, Spread } from 'pliego'
import arbol from './shapes/arbol.svg?raw'
import casa from './shapes/casa.svg?raw'
import colina from './shapes/colina.svg?raw'

/**
 * Libro de prueba con la bisagra arriba, como Estratos: las hojas se pasan
 * hacia arriba y se baja una capa cada vez. En los spreads, `x` es la
 * distancia al lomo hacia abajo y `at` recorre el ancho. Cada capa tiene
 * su grosor y su color de canto: el corte del libro es un corte geológico.
 */
export function EstratosBook() {
  return (
    <Book hinge="top" size={[1.4, 0.9]} coverColor="#6b5a4a">
      <Spread id="hoy" thickness={0.03} edgeColor="#b8a17e" pageColor="#e3d6bd">
        <PopUp x={0.45} at={0.35}>
          <Paper src={casa} height={0.3} color="#c0614b" />
        </PopUp>
        <PopUp x={0.5} at={-0.3}>
          <Paper src={arbol} height={0.32} color="#5b8e7d" />
        </PopUp>
      </Spread>
      <Spread id="antropoceno" thickness={0.02} edgeColor="#6e6a66">
        <PopUp x={0.4} at={0}>
          <Paper src={colina} width={0.9} color="#8a8178" />
        </PopUp>
      </Spread>
      <Spread id="cretacico" thickness={0.06} edgeColor="#c98b5a">
        <PopUp x={0.45} at={0.2}>
          <Paper src={arbol} height={0.4} color="#6f8f4e" />
        </PopUp>
      </Spread>
      <Spread id="origen" thickness={0.045} edgeColor="#4b5d73">
        <PopUp x={0.4} at={0}>
          <Paper src={colina} width={0.7} color="#3d4a5c" />
        </PopUp>
      </Spread>
    </Book>
  )
}
