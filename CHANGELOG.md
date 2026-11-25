# Changelog

Todos los cambios importantes de `pliego` se anotan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones, [versionado semántico](https://semver.org/lang/es/).

## [0.2.0] - 2026-11-25

### Añadido

- `<Paper>`: piezas de cartulina recortadas desde un SVG (texto importado con `?raw`), escaladas con `width` o `height`, con huecos y con el grosor de una cartulina.
- Bordes irregulares, como recortados a tijera, con semilla para que cada pieza salga siempre igual (`roughEdges`).
- Material de papel: grano procedural generado por código como normalMap, sin imágenes, y cantos más oscuros. Lo usan también las hojas y las tapas.
- `<PaperLights>`: luz cálida con sombras de borde suave, luz de cielo y suelo, y sombra de contacto bajo el libro. Se ajusta con la prop `lights` de `<PliegoCanvas>`.

### Cambiado

- El playground usa formas SVG (casas, árboles, colinas, un molino y nubes).

## [0.1.0] - 2026-11-25

### Añadido

- `<Book>`: libro tumbado con tapas, contratapa y una hoja rígida por spread que gira sobre la bisagra izquierda. Cerrado se centra en pantalla.
- `<Spread id>`: escena de cada doble página. De momento se levanta al terminar de abrirse; el despliegue pop-up de verdad llega en v0.3.
- Store con zustand (`useBook`, `useBookStore`): página actual, posición animada, giro en curso e idioma.
- Paso de hojas animado con GSAP, que respeta `prefers-reduced-motion`.
- Navegación: teclado (← → Re Pág Av Pág Inicio Fin), `#id` del spread en la URL y arrastre con ratón o dedo.
- `<BookArrows>`: flechas HTML accesibles con número de página.

### Cambiado

- `<PliegoCanvas>` mira a la mesa desde arriba y acepta `cameraPosition`, `target` y `fov`.
- Las sombras usan `PCFShadowMap`, porque Three 0.187 retiró `PCFSoftShadowMap`.
- El playground muestra un libro de prueba de cuatro spreads en lugar del cubo.

## [0.0.0] - 2026-11-25

### Añadido

- Librería con Vite en modo librería, TypeScript estricto y tipos generados.
- `<PliegoCanvas>`: lienzo con cámara, luz cálida con sombras suaves y sombra de contacto.
- Funciones de easing (`clamp`, `lerp`, `easeInOutCubic`, `easeOutCubic`) con tests.
- Playground con un cubo de papel girando, publicado en GitHub Pages.
- ESLint, Prettier, Vitest y CI en GitHub Actions.
