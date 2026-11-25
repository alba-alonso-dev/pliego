# Changelog

Todos los cambios importantes de `pliego` se anotan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones, [versionado semántico](https://semver.org/lang/es/).

## [0.4.0] - 2026-11-25

### Añadido

- `<HandDrawn>`: trazos a mano desde un SVG de líneas, dibujados con tinta sobre el papel y pegados a su página. Admite un SVG por idioma (`{ es, en }`).
- `reveal` en `<HandDrawn>`: el trazo se dibuja solo, uno detrás de otro, cuando el spread queda abierto; se borra cuando el spread deja de verse. Con `prefers-reduced-motion` aparece entero.
- `<PrintedLayer>`: ilustración impresa plana sobre una página (PNG, WebP o SVG), siempre visible al pasar la hoja, con parallax por capa y orden de apilado.
- `<OnPage>`: pega cualquier contenido a la superficie de una página para que gire con su hoja.
- `useParallaxPointer()`: puntero del ratón o del giroscopio, compartido por la cámara y las capas.
- Guía para pasar un dibujo a mano a SVG con Inkscape: [docs/guia-trazos.md](docs/guia-trazos.md).

### Cambiado

- `<PopUp>` usa `<OnPage>` por dentro; su comportamiento no cambia.

## [0.3.1] - 2026-11-25

### Cambiado

- Las piezas pop-up se levantan y se pliegan a la vez que gira la hoja, desde el primer grado. El retardo por profundidad ya no las deja quietas: solo hace su curva algo más tardía.
- La hoja gira con arranque y frenada más suaves (curva de seno) y algo más despacio: 1,15 s por hoja.
- Nueva función `easeInOutSine`.

### Corregido

- El interior de la contratapa lleva una guarda del color del papel, como la tapa: el último spread ya no parece que tenga una hoja de menos.

## [0.3.0] - 2026-11-25

### Añadido

- `<PopUp at x angle delay>`: las piezas se levantan según el ángulo de apertura del spread, las del fondo antes que las del frente, y van pegadas a su página: al pasar la hoja giran con ella mientras se pliegan encima.
- Matemática del pliegue en `math/fold.ts` (`elevation`, `depthDelay`…) y `useSpread()` con el ángulo de apertura.
- Parallax de cámara con el ratón o la inclinación del móvil (prop `parallax`), que respeta `prefers-reduced-motion`.
- `<Table>`: mesa de madera clara generada por código, con niebla para fundirla con el fondo.
- `<PaperEffects>`: oclusión ambiental entre capas, antialiasing, viñeta ligera y tone mapping neutro.

### Cambiado

- `@react-three/postprocessing` y `postprocessing` son ahora dependencias _peer_.
- `<Spread>` ya no levanta la escena por su cuenta; lo hace `<PopUp>`.

### Corregido

- Se usa `ShapePath.toShapes()` en lugar de `SVGLoader.createShapes()`, obsoleto desde Three r185.

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
