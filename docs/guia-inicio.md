# Guía de inicio: de cero a un libro de dos páginas

Esta guía monta un libro pop-up pequeño con Pliego: una tapa, dos páginas con piezas de cartulina y flechas para pasar las hojas.

## 1. Proyecto

Pliego es una librería de React. Lo más cómodo es un proyecto de Vite con React y TypeScript:

```bash
npm create vite@latest mi-libro -- --template react-ts
cd mi-libro
npm install github:alba-alonso-dev/pliego#v1.0.0 three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing
```

`three`, `@react-three/fiber`, `@react-three/drei` y el postprocesado son dependencias _peer_: las pone tu proyecto para que no haya copias repetidas.

## 2. El lienzo y el libro

```tsx
import { Book, BookArrows, PliegoCanvas, Spread } from 'pliego'

export function App() {
  return (
    <main style={{ position: 'fixed', inset: 0 }}>
      <PliegoCanvas>
        <Book coverColor="#b5543c">
          <Spread id="inicio">{/* piezas de la primera doble página */}</Spread>
          <Spread id="fin">{/* piezas de la segunda */}</Spread>
        </Book>
      </PliegoCanvas>
      <BookArrows />
    </main>
  )
}
```

- `<PliegoCanvas>` pone la cámara, la luz, la mesa y el postprocesado.
- `<Book>` crea una hoja por cada `<Spread>`. Se abre con las flechas, el teclado (← →), arrastrando la hoja o con `#id` en la URL.
- Cada `<Spread>` es lo que se ve con el libro abierto por esa doble página. El lomo está en `x = 0`: la página izquierda va de `x = -1` a `0` y la derecha de `0` a `1` (con el tamaño por defecto); `z` va del fondo (negativo) al frente (positivo).

## 3. Piezas de cartulina

Dibuja la forma en un SVG con rellenos (Inkscape, Figma…) e impórtala como texto con `?raw`:

```tsx
import casa from './formas/casa.svg?raw'

const inicio = (
  <Spread id="inicio">
    <PopUp at={-0.2} x={0.4}>
      <Paper src={casa} height={0.4} color="#d98e6a" />
    </PopUp>
  </Spread>
)
```

`<PopUp>` levanta la pieza al abrir la página y la pliega al pasarla. Para escenas con más cuerpo, usa los [mecanismos de papel](guia-mecanismos.md): quedan mejor al abrir y cerrar.

## 4. Lo que sigue

- [Mecanismos de papel](guia-mecanismos.md): tiendas, V, plataformas y capas.
- [Trazos a mano e ilustraciones impresas](guia-trazos.md).
- [Gestos y movibles](guia-gestos.md): lengüetas, ruedas, solapas y escenas que se tocan.
- [Idiomas y accesibilidad](guia-idiomas.md).
- [Referencia de la API](https://alba-alonso-dev.github.io/pliego/api/).
