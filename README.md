# Pliego

**Motor de libros pop-up 3D en estilo papercraft**, hecho con React y React Three Fiber.

> _Pliego_: hoja de papel que se dobla para formar las páginas de un libro.

Cada libro se compone con piezas de cartulina en 3D que se levantan al abrir la página, como en un pop-up de papel de verdad, con pequeños detalles dibujados a mano.

🔗 **Demo:** [alba-alonso-dev.github.io/pliego](https://alba-alonso-dev.github.io/pliego/)

## Estado

Versión **0.4**: un libro pop-up de cartulina. Las piezas recortadas desde SVG se levantan por capas al abrir cada doble página y se pliegan con su hoja al pasarla. Sobre el papel hay ilustraciones impresas con parallax y trazos a mano que se dibujan solos, sobre una mesa de madera con sombras suaves.
La hoja de ruta está en los [milestones](https://github.com/alba-alonso-dev/pliego/milestones).

| Versión | Hito                                                  |
| ------- | ----------------------------------------------------- |
| v0.0    | Arranque: librería, playground, CI y GitHub Pages     |
| v0.1    | Libro: tapas y hojas que pasan                        |
| v0.2    | Papel: cartulina desde SVG, grano y sombras           |
| v0.3    | Pop-up: piezas que se levantan al abrir               |
| v0.4    | A mano: trazos que se dibujan solos                   |
| v0.4.5  | Mecanismos: pliegues paralelos y en V, capas          |
| v0.5    | Gestos: interacción con progreso 0→1                  |
| v0.6    | Idiomas y calidad: i18n, accesibilidad, carga y móvil |

## Libros hechos con Pliego

- [Estratos](https://github.com/alba-alonso-dev/estratos): un libro que se lee hacia abajo, capa a capa, por la historia de la Tierra.
- [Carta desde 2080](https://github.com/alba-alonso-dev/carta-2080): un pop-up solarpunk escrito desde el futuro.

## Uso

Se instala directamente desde GitHub, fijando una versión:

```bash
npm install github:alba-alonso-dev/pliego#v0.4.0
```

```tsx
import { Book, BookArrows, Paper, PliegoCanvas, PopUp, Spread } from 'pliego'
import casa from './formas/casa.svg?raw'

export function App() {
  return (
    <>
      <PliegoCanvas>
        <Book size={[1, 1.4]} coverColor="#b5543c">
          <Spread id="energia">
            <PopUp at={-0.2} x={0.3}>
              <Paper src={casa} height={0.4} color="#d98e6a" />
            </PopUp>
          </Spread>
          <Spread id="comida">{/* … */}</Spread>
        </Book>
      </PliegoCanvas>
      <BookArrows />
    </>
  )
}
```

| Pieza                     | Qué hace                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `<PliegoCanvas>`          | Lienzo 3D con cámara, luz y sombras                                                          |
| `<Book>`                  | El libro: una hoja por cada `<Spread>`. Props `size`, `thickness`, colores y navegación      |
| `<Spread id>`             | Escena de una doble página; el lomo está en `x = 0`. El `id` es también el `#hash` de la URL |
| `<PopUp at x>`            | Pliegue al que se pegan las piezas: las levanta al abrir el spread y las lleva con su hoja   |
| `<Paper src>`             | Pieza de cartulina recortada desde un SVG, con grosor, grano y bordes irregulares            |
| `<HandDrawn src>`         | Trazo a mano (SVG de líneas) con tinta sobre la página; con `reveal` se dibuja solo          |
| `<PrintedLayer src side>` | Ilustración impresa sobre una página, con `parallax` por capa                                |
| `<BookArrows>`            | Flechas HTML accesibles, fuera del lienzo                                                    |
| `useBook()`               | `{ current, count, next, prev, goTo, goToId, … }` para hacer tus propios controles           |

`<Paper>` acepta `width` o `height` (tamaño final), `color`, `depth` (grosor), `anchor` (`bottom` para piezas de pie, `center`) y `roughEdges` (irregularidad del borde; `false` para un borde perfecto). Cada `<path>`, `<rect>` o `<polygon>` relleno del SVG es una pieza; los huecos interiores se respetan.

`<PopUp>` se coloca con `at` (profundidad de la línea de pliegue: negativo es el fondo de la página) y `x` (el lomo está en `x = 0`). Las piezas del fondo se levantan antes; `angle` es su ángulo final (90 = de pie) y `delay` cambia cuándo empiezan a subir.

Los dibujos a mano y las ilustraciones impresas se preparan como se explica en la [guía de trazos](docs/guia-trazos.md).

`<PliegoCanvas>` admite `lights` (luz y sombras), `parallax` (recorrido de la cámara; `false` lo quita), `table` (la mesa de madera) y `effects` (oclusión ambiental, viñeta y tono). Todo se puede desactivar.

`<Book>` activa por defecto el teclado, el hash en la URL y el arrastre; se desactivan con `keyboard={false}`, `hash={false}` o `drag={false}`.

`react`, `react-dom`, `three`, `@react-three/fiber` y `@react-three/drei` son dependencias _peer_: las instala el proyecto que usa Pliego.

## Desarrollo

Requiere **Node 24** (ver `.nvmrc`).

```bash
npm install
npm run dev          # playground en http://localhost:5173/pliego/
```

| Script                     | Qué hace                              |
| -------------------------- | ------------------------------------- |
| `npm run dev`              | Playground con recarga en caliente    |
| `npm run build`            | Compila la librería en `dist/`        |
| `npm run build:playground` | Compila la demo en `dist-playground/` |
| `npm run lint`             | ESLint                                |
| `npm run format`           | Formatea con Prettier                 |
| `npm run typecheck`        | Comprueba los tipos                   |
| `npm test`                 | Tests con Vitest                      |

```
pliego/
├── src/          librería (lo que se publica)
├── playground/   app de prueba y demo pública
└── .github/      CI y despliegue en GitHub Pages
```

## Licencia

[MIT](LICENSE) © Alba Alonso
