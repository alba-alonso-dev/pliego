# Guía: gestos y movibles

## `useGesture()`

Convierte un gesto sobre un objeto 3D en un progreso de 0 a 1 que puedes usar para animar lo que quieras. Mientras dura el gesto, la hoja no se pasa.

```tsx
function Sol() {
  const sol = useGesture({ mode: 'drag', axis: 'y', distance: 180 })
  const arbol = useRef<Group>(null)
  useFrame(() => arbol.current?.scale.setScalar(0.4 + sol.progress() * 0.6))
  return (
    <>
      <group {...sol.bind}>{/* el sol */}</group>
      <group ref={arbol}>{/* un árbol */}</group>
    </>
  )
}
```

| Opción                       | Qué hace                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `mode`                       | `drag` (arrastrar), `hold` (mantener pulsado) o `click` (alterna entre 0 y 1) |
| `axis`, `invert`, `distance` | Dirección y recorrido del arrastre, en píxeles                                |
| `duration`, `release`        | Tiempo de `hold`/`click` y si al soltar se queda o vuelve                     |

`set()` y `toggle()` permiten manejarlo desde HTML o el teclado.

## Movibles

| Movible                                   | Uso                                                                                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `<PullTab side at label>`                 | Lengüeta en el borde de la página. Sus hijos `<Linked from to delay>` se mueven al tirar, cada uno con su retardo |
| `<Volvelle side x at radius label cover>` | Rueda que gira al arrastrarla; `cover` añade una tapa con ventana                                                 |
| `<Flap side x at width height label>`     | Solapa que se levanta con un clic                                                                                 |

Cada movible lleva un `label`: es el texto del control accesible que añade `<MovableControls>` fuera del lienzo (un deslizador o un botón), para manejarlo con el teclado o un lector de pantalla.

## Animaciones de ambiente

`<Spin>` (girar), `<Sway>` (balancearse) y `<Bob>` (flotar) envuelven piezas para darles vida. Todas se paran con `prefers-reduced-motion`.

## Sonido

`<SoundToggle>` activa un sonido de papel sintetizado al pasar la hoja y al mover los movibles. Está apagado por defecto.
