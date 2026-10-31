# Singapore Math Lab — 8 actividades

## Instalación en tu proyecto Next.js

1. Descomprime el ZIP.
2. Copia la carpeta `app/singapore-math-lab` dentro de la carpeta `app` de tu proyecto. No reemplaces `app/page.tsx`, `app/layout.tsx` ni `package.json`.
3. Ejecuta `npx next dev --webpack` desde tu proyecto.
4. Abre http://localhost:3000/singapore-math-lab

## Contenido
- Actividades 1–4: barras con datos arrastrables **desde el enunciado**, ecuación y solución para x.
- Actividades 5–6: observar representaciones, escribir ecuación y resolver x.
- Actividades 7–8: construir la balanza vacía arrastrando una caja y canicas individuales, escribir ecuación, retirar una canica de cada lado por paso y resolver x.

En computadoras, arrastra con el mouse. En pantallas táctiles, selecciona una pieza y toca el destino. No requiere bibliotecas adicionales.

**Nota pedagógica:** en la actividad 6 la sustracción se muestra como una transformación pictórica de una caja, no como dos platillos de una balanza estática: representar x sola frente a 5 significaría x=5, no x-3=5.


## Actualización visual de la balanza
Balanza de mayor definición con estructura metálica, platillos suspendidos, sombras, canicas brillantes y animaciones de caída. Respeta el movimiento reducido del sistema. Se mantienen las ocho actividades y sus comprobaciones.


### Balanza basada en imagen de referencia
La barra, cables diagonales, platillos trapezoidales y pedestal son un solo SVG vectorial detrás de las zonas interactivas. Los objetos continúan siendo componentes React arrastrables.


## Ajuste de alineación
Se corrigió la superposición de platillos: los objetos interactivos ahora descansan sobre los platillos del SVG, en lugar de dibujar un segundo par de platillos flotantes.

## Ajuste de canicas y platillos
Se reubican los objetos para que descansen sobre la superficie de los platillos; las canicas de las balanzas tienen un diámetro máximo de 36px, el doble del anterior (18px). En móviles se ajusta para evitar desbordes.


## Selección múltiple de canicas
En las actividades 7 y 8, selecciona la cantidad de canicas con los botones o el campo numérico y arrastra una canica al platillo. Se depositará el lote completo. También puedes seleccionar una canica y pulsar el platillo. El número de canicas disponibles se actualiza automáticamente.

## Arrastre directo de canicas (actividades 7 y 8)
- No hay botones para indicar cuántas canicas mover.
- Haz clic en las canicas individuales de la bandeja para seleccionar varias (borde verde).
- Arrastra **una de las seleccionadas** a un platillo; se moverán todas las seleccionadas.
- Alternativamente, selecciona varias y haz clic en el platillo.
- Para corregir: selecciona las canicas **dentro del platillo** y arrastra una seleccionada a la bandeja, o al otro platillo.
- La caja amarilla también puede moverse de vuelta a la bandeja.
- Después de comprobar el modelo y la ecuación, se habilita la retirada simultánea de canicas de ambos lados.
