# Pliego

**Motor de libros pop-up 3D en estilo papercraft**, hecho con React y React Three Fiber.

> _Pliego_: hoja de papel que se dobla para formar las páginas de un libro.

Cada libro se compone con piezas de cartulina en 3D que se levantan al abrir la página, como en un pop-up de papel de verdad, con pequeños detalles dibujados a mano.

🔗 **Demo:** [alba-alonso-dev.github.io/pliego](https://alba-alonso-dev.github.io/pliego/)

## Estado

Versión **0.0**: arranque del proyecto. De momento el playground muestra un cubo de papel girando.
La hoja de ruta está en los [milestones](https://github.com/alba-alonso-dev/pliego/milestones).

| Versión | Hito                                                  |
| ------- | ----------------------------------------------------- |
| v0.0    | Arranque: librería, playground, CI y GitHub Pages     |
| v0.1    | Libro: tapas y hojas que pasan                        |
| v0.2    | Papel: cartulina desde SVG, grano y sombras           |
| v0.3    | Pop-up: piezas que se levantan al abrir               |
| v0.4    | A mano: trazos que se dibujan solos                   |
| v0.5    | Gestos: interacción con progreso 0→1                  |
| v0.6    | Idiomas y calidad: i18n, accesibilidad, carga y móvil |

## Libros hechos con Pliego

- [Estratos](https://github.com/alba-alonso-dev/estratos): un libro que se lee hacia abajo, capa a capa, por la historia de la Tierra.
- [Carta desde 2080](https://github.com/alba-alonso-dev/carta-2080): un pop-up solarpunk escrito desde el futuro.

## Uso

Se instala directamente desde GitHub, fijando una versión:

```bash
npm install github:alba-alonso-dev/pliego#v0.0.0
```

```tsx
import { PliegoCanvas } from 'pliego'

export function App() {
  return <PliegoCanvas>{/* el libro irá aquí */}</PliegoCanvas>
}
```

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
