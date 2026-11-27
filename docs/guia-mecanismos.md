# Guía: mecanismos de papel

En un pop-up de papel nada se anima: cada pieza va pegada a las dos páginas y su forma la impone la apertura del libro. Pliego calcula esa geometría de verdad, así que las piezas se levantan, se pliegan y nunca atraviesan el papel.

## Pliegue paralelo: tiendas y escalones

Los pliegues de la pieza son paralelos al lomo. `a` y `b` son las distancias de los pegados al lomo en cada página; `left` y `right`, los largos de los dos paneles.

```tsx
<ParallelFold {...tentFold(0.14, 0.24)} at={-0.4} width={0.3} color="#c0614b" />
```

- `tentFold(distancia, panel)`: tienda, de pie con el libro abierto del todo.
- `stepFold(a, b)`: escalón, que está completo con el libro a 90°.
- Regla: `a + left` debe ser igual a `b + right`. Si no, la pieza no se plegaría y Pliego avisa por consola.

## Pliegue en V

Dos paneles pegados a las páginas a lo largo de líneas que forman `glueAngle` grados con el lomo, unidos por un pliegue central. `pieceAngle` es el ángulo de la pieza entre su pliegue central y cada línea de pegado.

```tsx
<VFold at={0.6} glueAngle={30} pieceAngle={75} base={0.28} height={0.3} color="#5b8e7d" />
```

- Con `pieceAngle` 90 queda de pie; con menos, se inclina hacia donde van las líneas de pegado (`toward`).
- `pieceAngle` debe ser al menos `glueAngle`, o no se levanta (Pliego avisa).
- Las V grandes conviene ponerlas cerca del frente para que no asomen con el libro cerrado (también avisa).

## Plataforma flotante

Un suelo elevado sobre el spread. Se comporta como un libro más: sus hijos son mecanismos montados encima.

```tsx
<FloatingLayer distance={0.3} height={0.1} width={0.32} color="#e9c46a">
  <ParallelFold {...tentFold(0.08, 0.13)} width={0.22} />
</FloatingLayer>
```

## Capas

- `<Valley side>`: monta mecanismos en el pliegue entre un panel y su página. Es la «V en cascada»: la grande crea el pliegue en el que se apoya la pequeña.
- `<OnPanel side>`: pega contenido a un panel para que gire con él (un «pivote»).

```tsx
<VFold at={0.6} glueAngle={30} pieceAngle={75}>
  <Valley side="right">
    <VFold glueAngle={25} pieceAngle={80} base={0.16} height={0.18} />
  </Valley>
  <OnPanel side="left">
    <Paper src={nube} width={0.16} anchor="center" position={[0.16, 0.12, -0.006]} />
  </OnPanel>
</VFold>
```

## Detalles de papel

- `tabs`: pestañas de pegado tumbadas sobre las páginas (0 las quita).
- Los cantos son más claros que la cara, como el alma blanca de una cartulina impresa.

## Base

Glassner, _Interactive Pop-Up Card Design_ (1998); Low et al., _Multi-style paper pop-up_ (2013); Museo del Papel de Georgia Tech, _Physics of Paper Engineering_.
