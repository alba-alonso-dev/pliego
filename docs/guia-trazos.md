# Guía: de un dibujo a mano a `<HandDrawn>`

Los detalles a mano (anotaciones, flechas, una firma, dibujitos) llegan a `<HandDrawn>` como **SVG de trazos**: líneas sin relleno. El grosor y el color de la tinta los pone el motor, así que todas las páginas comparten el mismo trazo.

Regla de estilo: como mucho 2 o 3 detalles a mano por página, para que destaquen.

## 1. Dibujar

- **En tableta** (Procreate, Krita, Fresco…): pincel de tinta, negro sobre blanco, sin texturas ni sombreados. Exporta un PNG a buena resolución (2000 px de ancho o más).
- **En papel**: rotulador fino negro sobre papel blanco liso. Escanéalo a 300 ppp en escala de grises, o hazle una foto con buena luz y sin sombras.
- Dibuja cada detalle por separado, en su propio archivo.

## 2. Limpiar la imagen (opcional)

En cualquier editor de fotos:

1. Recorta el dibujo dejando un margen pequeño.
2. Sube el contraste hasta que el fondo quede blanco y la línea negra (Niveles o Curvas).
3. Borra las manchas y los puntos sueltos.

## 3. Vectorizar en Inkscape

Con Inkscape 1.x (entre paréntesis, el nombre del menú en inglés):

1. **Archivo → Importar** el PNG (incrustado).
2. Selecciónalo y abre **Trayecto → Vectorizar mapa de bits** (_Path → Trace Bitmap_, Mayús+Alt+B).
3. En la pestaña **Escaneo único**, elige **Trazado de línea central** (_Centerline tracing (autotrace)_). Así sale una sola línea por el centro de cada trazo, que es lo que necesita `<HandDrawn>`.
   - Si no aparece, el modo **Detección de bordes** (_Edge detection_) también sirve, pero da el contorno de la línea y se verá doble.
4. Pulsa **Aplicar** y borra la imagen original (queda debajo del vector).
5. Con el vector seleccionado, **Trayecto → Simplificar** (Ctrl+L) una o dos veces para quitar puntos de sobra. No te pases: el temblor de la mano es lo que le da gracia.
6. En **Relleno y borde** (Mayús+Ctrl+F): relleno **ninguno**, borde negro.
7. **Edición → Redimensionar página a la selección** (Mayús+Ctrl+R).
8. **Archivo → Guardar como… → SVG simple**.

## 4. Requisitos del SVG

- Solo trazos: `<path>`, `<line>`, `<polyline>`, `<polygon>`, `<rect>`, `<circle>`… El relleno se ignora; cada subtrazo se dibuja como una línea.
- **Textos convertidos a trayecto** (Trayecto → Objeto a trayecto): `<HandDrawn>` no lee `<text>`.
- Sin imágenes incrustadas, máscaras ni filtros.
- El tamaño no importa: `<HandDrawn>` escala el dibujo al `width` o `height` que le pidas.
- **El orden de los trazos es el orden en que se dibujan** con `reveal`. Si quieres que la flecha salga antes que la punta, deja la flecha primero en el XML (en Inkscape: **Objeto → Bajar al fondo**).
- Conviene que pese poco: menos de 20 kB por dibujo.

## 5. Usarlo en el libro

Guarda el SVG junto al libro e impórtalo como texto con `?raw`:

```tsx
import flecha from './trazos/flecha.svg?raw'

const colinas = (
  <Spread id="colinas">
    <HandDrawn src={flecha} x={-0.3} at={0.35} width={0.3} reveal />
  </Spread>
)
```

| Prop                 | Qué hace                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `x`, `at`            | Centro del dibujo sobre el spread (el lomo está en `x = 0`; `at` va del fondo, negativo, al frente, positivo) |
| `side`               | Página sobre la que va; por defecto, la del lado de `x`                                                       |
| `width` / `height`   | Tamaño final en unidades del mundo                                                                            |
| `rotate`             | Giro sobre la página, en grados                                                                               |
| `color`, `lineWidth` | Tinta y grosor del trazo                                                                                      |
| `reveal`             | Dibujar el trazo poco a poco al abrir el spread; admite `{ duration, delay }` en segundos                     |

### Un dibujo por idioma

Si el dibujo tiene texto (una nota, una etiqueta), haz una versión por idioma y pásalas juntas. Se usa la del idioma activo y, si falta, la primera:

```tsx
import notaEs from './trazos/nota.es.svg?raw'
import notaEn from './trazos/nota.en.svg?raw'

const nota = <HandDrawn src={{ es: notaEs, en: notaEn }} x={0.4} at={-0.3} width={0.35} />
```

## Ilustraciones impresas (`<PrintedLayer>`)

Para fondos con color (cielos, paisajes lejanos) usa `<PrintedLayer>` en lugar de `<HandDrawn>`: una imagen plana impresa sobre la página.

- **Formato**: PNG o WebP con transparencia, o SVG con `width` y `height`. Impórtala con `?url`.
- **Una imagen por página**: cada página gira por su cuenta, así que una ilustración a doble página se parte en dos mitades.
- **Proporción de la página** (1 × 1,4 por defecto), por ejemplo 1000 × 1400 px.
- **Capas**: separa el fondo (fijo) de lo que quieres que se mueva con `parallax`. Ordénalas con `order`.
- **Margen transparente** en las capas con `parallax`: el dibujo se desplaza dentro de su recuadro, así que necesita algo de aire en los bordes (un 3 % basta para `parallax={0.02}`).
