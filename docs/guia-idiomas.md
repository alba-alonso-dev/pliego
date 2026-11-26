# Guía: idiomas y accesibilidad

## Diccionarios

Cada idioma es un diccionario con los textos de cada spread (por su `id`) y los comunes en `_`. Añadir un idioma es añadir un archivo.

```ts
// locales/es.ts
export const es: Dictionary = {
  _: { title: 'Mi libro', hint: 'Usa las flechas para pasar la hoja' },
  inicio: { title: 'Érase una vez', text: ['Primer párrafo.', 'Segundo párrafo.'] },
}
```

```tsx
<Languages dictionaries={{ es, en }} fallback="es" />
<PageText />
<LanguageSwitcher />
```

- El idioma se elige por la URL (`?lang=en`), el guardado o el del navegador, y se refleja en `<html lang>`.
- `useT()` devuelve los textos: `t('title')` busca en el spread abierto, luego en los comunes y luego en el idioma de reserva.
- `<HandDrawn src={{ es: notaEs, en: notaEn }}>` usa el dibujo del idioma activo.

## Accesibilidad

- `<PageText>` pone el título y el texto del spread abierto en HTML, fuera del lienzo: lo leen los lectores de pantalla (se anuncia al cambiar de página), los buscadores y quien lo quiera traducir o seleccionar.
- `<BookArrows>` y `<MovableControls>` son botones y deslizadores HTML de verdad: todo se puede hacer con el teclado.
- Todas las animaciones respetan `prefers-reduced-motion`: las hojas pasan sin giro, los trazos aparecen enteros y las animaciones de ambiente se paran.
- Pásales a los componentes los textos traducidos (`labels`) con `useT()`.

## Móvil

- En pantallas estrechas la cámara se aleja para que quepa el libro abierto.
- `<PliegoCanvas adaptive>` baja la resolución y quita el postprocesado si el dispositivo no llega a unos 30 fps.
- `<LoadingScreen>` muestra el progreso mientras cargan las ilustraciones.
