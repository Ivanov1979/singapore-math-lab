# Ludo Matemático del Tesoro — Next.js

Ruta: `/ludo-matematico`.

## Integración

1. Copia `app/ludo-matematico/page.tsx` y `page.module.css` a la carpeta `app/ludo-matematico/` de tu proyecto Singapore Math Lab.
2. Ejecuta `npm run dev`.
3. Abre `http://localhost:3000/ludo-matematico`.
4. Para subir a GitHub: `git add . && git commit -m "Add 40-square mathematical Ludo game" && git push`.

## Mecánica

- 10 avatares y nombre de equipo.
- 40 preguntas fijas: una por casilla; ocho categorías.
- Dado virtual de 1 a 6 y movimiento hasta un máximo de casilla 40.
- Al caer, se revela la pregunta con tres alternativas.
- El equipo debe registrar su argumento; la aplicación comprueba la alternativa.
- Un docente o equipo revisor valida la calidad de la argumentación.
- Una oportunidad de revisión cuando se elige mal; si no se valida, se vuelve a la posición anterior.
- Reflexión metacognitiva y bitácora descargable como archivo TXT.

## Nota didáctica

La aplicación no evalúa automáticamente la calidad semántica de los argumentos. El docente debe comprobar que el razonamiento es válido antes de confirmar el avance. El tablero es un prototipo funcional de cuadrícula, no un mapa ilustrado. La bitácora permanece en memoria durante la sesión; descárgala antes de cerrar o reiniciar.
