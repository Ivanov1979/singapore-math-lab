'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

export type StudentOption = {
  code: string;
  firstName: string | null;
  lastName: string | null;
};

type Props = {
  onSelect: (student: StudentOption) => void;
};

export default function StudentSelector({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.trim().length < 3) {
      setStudents([]);
      setLoading(false);
      setError('');
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/students/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Student search failed');
        }

        const data: { students?: StudentOption[] } =
          await response.json();

        setStudents(data.students ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setError('No se pudo consultar la lista de estudiantes.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <section className={styles.panel}>
      <h2>Identificación del estudiante</h2>
      <p>Escribe al menos tres letras de tu nombre o apellido.</p>

      <input
        type="text"
        aria-label="Buscar estudiante"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar estudiante..."
        autoComplete="off"
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 8,
          border: '1px solid #94a3b8',
        }}
      />

      {loading && <p>Buscando...</p>}
      {error && <p role="alert">{error}</p>}

      <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
        {students.map((student) => (
          <button
            key={student.code}
            type="button"
            className={styles.secondary}
            onClick={() => onSelect(student)}
          >
            {student.firstName} {student.lastName}
          </button>
        ))}
      </div>
    </section>
  );
}
