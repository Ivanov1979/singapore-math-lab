'use client';

import ExitTicketForm from "@/components/ExitTicketForm";
import { useEffect, useRef, useState } from 'react';
import ClassicDice from './ClassicDice';
import styles from './page.module.css';
import StudentSelector, { type StudentOption } from './StudentSelector';
import { challenges, sections } from '@/lib/ludo/challenges';




const avatars = [
  ['🏴‍☠️', 'Capitán Barba Roja'], ['🦜', 'Paco el Loro'], ['🐙', 'Ocho el Pulpo'], ['🦈', 'Tiburón Azul'], ['🧜‍♀️', 'Marina'],
  ['🐒', 'Coco el Mono'], ['🐢', 'Tito la Tortuga'], ['🤖', 'Robot Pirata'], ['🧙', 'Mago del Mar'], ['🦊', 'Zorro Explorador']
];

export default function LudoMatematico() {
  const [avatar, setAvatar] = useState(0);
  const [team, setTeam] = useState('');
  const [student, setStudent] = useState<StudentOption | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const submissionKeyRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<
    'setup' | 'roll' | 'moving' | 'question' | 'review' | 'won'
  >('roll');

  const [position, setPosition] = useState(0), [previous, setPrevious] = useState(0), [die, setDie] = useState<number | null>(null), [selected, setSelected] = useState<number | null>(null), [argument, setArgument] = useState(''), [reflection, setReflection] = useState(''), [tries, setTries] = useState(0), [log, setLog] = useState<string[]>([]);
  const question = challenges[position - 1]; const correct = question && selected === question.correct;
  const movementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (movementTimer.current !== null) clearTimeout(movementTimer.current); }, []);
  function roll(value: number) {
    if (saving) return;
    submissionKeyRef.current = null;
    setSaveError('');
    const start = position;
    const destination = Math.min(40, start + value);
    setDie(value); setPrevious(start); setSelected(null); setArgument(''); setReflection(''); setTries(0); setPhase('moving');
    let next = start;
    function advance() {
      if (next >= destination) { movementTimer.current = null; setPhase('question'); return; }
      next += 1;
      setPosition(next);
      movementTimer.current = setTimeout(advance, 260);
    }
    movementTimer.current = setTimeout(advance, 180);
  }
  async function finish(valid: boolean) {
    if (saving || !student || selected === null || !question || !argument.trim() || !reflection.trim()) return;
    setSaving(true);
    setSaveError('');
    if (!submissionKeyRef.current) submissionKeyRef.current = crypto.randomUUID();

    try {
      const response = await fetch('/api/ludo-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentCode: student.code,
          questionNumber: position,
          selectedOption: selected,
          argument,
          reflection,
          attempts: tries,
          argumentValidated: valid,
          submissionKey: submissionKeyRef.current,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result: { saved?: boolean } = await response.json();
      if (result.saved !== true) throw new Error('Save was not confirmed');

      const landing = position;
      if (!valid) setPosition(previous);
      setLog(old => [
        `${avatars[avatar][1]}: casilla ${landing}, dado ${die}, ${valid ? 'argumento validado' : 'regresa a ' + previous}. ${argument} | Reflexión: ${reflection}`,
        ...old,
      ]);
      submissionKeyRef.current = null;
      setDie(null);
      setPhase(valid && landing === 40 ? 'won' : 'roll');
    } catch (error) {
      console.error('Error saving Ludo response:', error);
      setSaveError('No se pudo guardar la respuesta. Inténtalo nuevamente.');
    } finally {
      setSaving(false);
    }
  }
  function reset() { if (saving) return; submissionKeyRef.current = null; setSaveError(''); if (movementTimer.current !== null) { clearTimeout(movementTimer.current); movementTimer.current = null; } setPhase('roll'); setPosition(0); setPrevious(0); setDie(null); setSelected(null); setArgument(''); setReflection(''); setTries(0); setLog([]); }

  if (!student) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>
            SINGAPORE MATH LAB · 5° BÁSICO
          </span>

          <h1>🏴‍☠️ Ludo Matemático</h1>
          <p>Selecciona tu nombre para comenzar la aventura.</p>
        </header>

        <StudentSelector
          onSelect={(selectedStudent) => {
            setStudent(selectedStudent);
            setTeam(
              `${selectedStudent.firstName ?? ''} ${selectedStudent.lastName ?? ''}`.trim()
            );
          }}
        />
      </main>
    );
  }

  return <main className={styles.page}><header className={styles.header}><span className={styles.eyebrow}>SINGAPORE MATH LAB · 5° BÁSICO</span><h1>🏴‍☠️ Ludo Matemático</h1><p>La búsqueda del tesoro · 40 desafíos de ecuaciones de un paso</p></header>
    {phase === 'setup' ? <section className={styles.panel}><h2>1. Elijan su aventurero</h2><p>Un personaje representará a todo el equipo. Cada estudiante participa en las decisiones.</p><div className={styles.avatars}>{avatars.map(([icon, name], i) => <button key={name} type="button" className={`${styles.avatar} ${avatar === i ? styles.active : ''}`} onClick={() => setAvatar(i)}><span>{icon}</span><strong>{name}</strong></button>)}</div><label className={styles.field}>Nombre del equipo<input value={team} onChange={e => setTeam(e.target.value)} maxLength={40} placeholder="Los exploradores" /></label><button className={styles.primary} disabled={!team.trim()} onClick={() => setPhase('roll')}>Comenzar aventura →</button></section> : <><div className={styles.status}><strong>{avatars[avatar][0]} {team}</strong><span>Casilla {position} / 40</span><ClassicDice onRoll={roll} disabled={saving || phase !== 'roll'} /></div><div className={styles.board}>{Array.from({ length: 40 }, (_, i) => i + 1).map(n => <div key={n} className={`${styles.square} ${n === position ? styles.occupied : ''} ${n <= 5 ? styles.blue : n <= 10 ? styles.orange : n <= 15 ? styles.violet : n <= 20 ? styles.green : n <= 25 ? styles.blue : n <= 30 ? styles.orange : n <= 35 ? styles.violet : styles.gold}`} title={`${n}: ${sections[Math.floor((n - 1) / 5)]}`}><small>{n}</small><span>{n === position ? avatars[avatar][0] : n === 40 ? '💰' : n === position && phase === 'question' ? '❓' : '✦'}</span></div>)}</div>
      {phase === 'roll' && <section className={styles.panel}><h2>🎲 ¡Lancen el dado!</h2><p>Utilicen el dado que está arriba, junto al nombre del equipo. Para conservar la nueva casilla, resuelvan y justifiquen el desafío.</p></section>}{phase === 'moving' && <section className={styles.panel}><h2>🏴‍☠️ ¡El aventurero está avanzando!</h2><p>El dado marcó {die}. Observen cómo avanza por el tablero.</p></section>}
      {(phase === 'question' || phase === 'review') && question && <section className={styles.panel}><div className={styles.flipCard}><span className={styles.eyebrow}>CASILLA {position} · {sections[Math.floor((position - 1) / 5)]}</span><h2>{question.prompt}</h2></div>{phase === 'question' ? <><h3>Seleccionen una alternativa</h3><div className={styles.options}>{question.options.map((option, i) => <button key={i} className={`${styles.option} ${selected === i ? styles.chosen : ''}`} disabled={saving} onClick={() => { setSelected(i); submissionKeyRef.current = null; }}><b>{String.fromCharCode(65 + i)}.</b> {option}</button>)}</div><label className={styles.field}>Secretario: ¿por qué eligieron esa respuesta?<textarea value={argument} disabled={saving} onChange={e => { setArgument(e.target.value); submissionKeyRef.current = null; }} rows={3} placeholder="Nuestra respuesta es... porque..." /></label><button className={styles.primary} disabled={saving || selected === null || !argument.trim()} onClick={() => { setTries(v => v + 1); setPhase('review') }}>Comprobar alternativa</button></> : <><div className={correct ? styles.success : styles.warning}><strong>{correct ? '✓ Alternativa correcta' : '↻ Revisen su alternativa'}</strong><p>{correct ? `Comprobación: ${question.proof}. Ahora un compañero o el docente debe validar la explicación.` : 'La alternativa seleccionada no es correcta. Conversen y revisen su razonamiento.'}</p></div><label className={styles.field}>Metacognición: {question.reflection}<textarea value={reflection} disabled={saving} onChange={e => { setReflection(e.target.value); submissionKeyRef.current = null; }} rows={2} placeholder="Al principio pensamos... Después descubrimos..." /></label>{correct ? <div className={styles.actions}><button className={styles.primary} disabled={saving || !reflection.trim()} onClick={() => finish(true)}>Argumento validado · Conservar casilla</button><button className={styles.secondary} disabled={saving || !reflection.trim()} onClick={() => finish(false)}>Argumento insuficiente · Retroceder</button></div> : <div className={styles.actions}>{tries < 2 && <button className={styles.primary} disabled={saving} onClick={() => setPhase('question')}>Revisar una vez más</button>}<button className={styles.secondary} disabled={saving || !reflection.trim()} onClick={() => finish(false)}>Retroceder a casilla {previous}</button></div>}</>}{saving && <p role="status">Guardando respuesta en Neon…</p>}{saveError && <p role="alert">{saveError}</p>}</section>}
      {phase === 'won' && (
        <section className={styles.panel}>
          <h2>🏆 ¡Encontraron el tesoro!</h2>

          <p>
            ¡Felicitaciones, {team}! Llegaron a la casilla 40
            y justificaron su respuesta.
          </p>

          <h3>📝 Ticket de salida — Experiencia de Aprendizaje 2</h3>

          <p>
            Cada integrante del equipo debe resolver
            este desafío individualmente.
          </p>

          <ExitTicketForm
            experience="experiencia-2" />

          <button className={styles.primary} disabled={saving} onClick={reset}>
            Jugar nuevamente
          </button>
        </section>
      )}
      {log.length > 0 && <section className={styles.panel}><h2>Bitácora del equipo</h2><p>Registro de argumentos y reflexiones para revisión formativa.</p><button className={styles.secondary} onClick={() => { const blob = new Blob([log.slice().reverse().join('\n\n')], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'bitacora-ludo-matematico.txt'; a.click(); URL.revokeObjectURL(url) }}>Descargar bitácora (.txt)</button><ul className={styles.log}>{log.slice(0, 5).map((entry, i) => <li key={i}>{entry}</li>)}</ul></section>}
      <button className={styles.reset} disabled={saving} onClick={reset}>↺ Reiniciar juego</button></>}

    <footer>
      Regla: una respuesta correcta requiere también una justificación válida.
      El docente o equipo revisor valida los argumentos.
    </footer>
  </main>;
}