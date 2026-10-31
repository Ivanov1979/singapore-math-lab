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
