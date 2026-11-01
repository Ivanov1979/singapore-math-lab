'use client';

import { useState } from 'react';
import styles from './ClassicDice.module.css';

type Props = {
  onRoll: (value: number) => void;
  disabled?: boolean;
};

const orientations: Record<number, [number, number]> = {
  1: [0, 0],
  2: [-90, 0],
  3: [0, -90],
  4: [0, 90],
  5: [90, 0],
  6: [0, 180],
};

export default function ClassicDice({ onRoll, disabled = false }: Props) {
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [turns, setTurns] = useState(0);

  function handleRoll() {
    if (rolling || disabled) return;

    const result = Math.floor(Math.random() * 6) + 1;
    setRolling(true);
    setValue(result);
    setTurns((current) => current + 1);

    window.setTimeout(() => {
      setRolling(false);
      onRoll(result);
    }, 1500);
  }

  const [x, y] = orientations[value];

  return (
    <div className={styles.controls}>
      <div className={styles.stage} aria-label={`Dado: ${value}`}>
        <div
          className={styles.cube}
          style={{
            transform: `rotateX(${x + turns * 720}deg) rotateY(${y + turns * 720}deg)`,
          }}
        >
          {[
            ['front', 1],
            ['back', 6],
            ['right', 3],
            ['left', 4],
            ['top', 2],
            ['bottom', 5],
          ].map(([face, number]) => (
            <div
              key={face}
              className={`${styles.face} ${styles[String(face)]}`}
            >
              <span className={styles.pips} data-value={number}>
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} className={styles.pip} />
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.rollButton}
        onClick={handleRoll}
        disabled={disabled || rolling}
      >
        {rolling ? 'Girando...' : '🎲 Lanzar dado'}
      </button>
    </div>
  );
}
