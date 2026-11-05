
"use client";

import { useCallback, useEffect, useState } from "react";

type ExitTicket = {
  id: string;
  activityId: string;
  questionText: string;
  studentAnswer: string;
  justification: string;
  isCorrect: boolean;
  createdAt: string;
  student: {
    code: string;
    firstName: string | null;
    lastName: string | null;
    grade: number;
  };
};

const experiences: Record<string, string> = {
  "experiencia-2": "Experiencia 2 · Ludo Matemático",
  "experiencia-3": "Experiencia 3 · Singapore Math Lab",
};

const skills = [
  "Representar",
  "Modelar",
  "Resolver problemas",
  "Argumentar y comunicar",
];

function getStudentName(student: ExitTicket["student"]) {
  const fullName = [student.firstName, student.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || `Estudiante ${student.code}`;
}

export default function StudentMonitoring() {
  const [tickets, setTickets] = useState<ExitTicket[]>([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/teacher/exit-tickets",
        { cache: "no-store" }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "La consulta está deshabilitada. " +
            "Se requiere acceso docente autorizado."
          );
        }

        throw new Error(
          "No fue posible obtener los registros."
        );
      }

      const data: { tickets: ExitTicket[] } =
        await response.json();

      setTickets(data.tickets);
    } catch (err) {
      setTickets([]);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const studentCodes = Array.from(
    new Set(tickets.map((ticket) => ticket.student.code))
  ).sort();

  const activeCode = studentCodes.includes(selectedCode)
    ? selectedCode
    : studentCodes[0] ?? "";

  const studentTickets = tickets.filter(
    (ticket) => ticket.student.code === activeCode
  );

  const selectedStudent = studentTickets[0]?.student;

  const selectedStudentName = selectedStudent
    ? getStudentName(selectedStudent)
    : "";

  const correctCount = studentTickets.filter(
    (ticket) => ticket.isCorrect
  ).length;

  return (
    <section style={{ marginTop: 40, marginBottom: 40 }}>
      <h2>Monitoreo interactivo del aprendizaje</h2>

      <p>
        Evidencias individuales registradas en las
        experiencias de aprendizaje 2 y 3.
      </p>

      <button
        type="button"
        onClick={() => void loadTickets()}
        disabled={loading}
        style={{
          padding: "10px 16px",
          marginBottom: 20,
          cursor: "pointer",
        }}
      >
        Actualizar resultados
      </button>

      {loading && <p>Cargando resultados...</p>}

      {error && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      {!loading && !error && tickets.length === 0 && (
        <p>
          No hay tickets de salida registrados.
          Verifique que existan respuestas guardadas
          en la base de datos.
        </p>
      )}

      {!loading && !error && tickets.length > 0 && (
        <>
          <label
            htmlFor="student-selector"
            style={{
              display: "block",
              fontWeight: 700,
            }}
          >
            Seleccionar estudiante
          </label>

          <select
            id="student-selector"
            value={activeCode}
            onChange={(event) =>
              setSelectedCode(event.target.value)
            }
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#111827",
              width: "100%",
              maxWidth: 350,
            }}
          >
            {studentCodes.map((code) => {
              const student = tickets.find(
                (ticket) => ticket.student.code === code
              )?.student;

              return (
                <option key={code} value={code}>
                  {student
                    ? getStudentName(student)
                    : `Estudiante ${code}`}
                </option>
              );
            })}
          </select>

          <div
            style={{
              marginTop: 24,
              padding: 24,
              borderRadius: 12,
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3>Resultados de {selectedStudentName}</h3>

            <p>
              <strong>Tickets registrados:</strong>{" "}
              {studentTickets.length}
            </p>

            <p>
              <strong>Respuestas correctas:</strong>{" "}
              {correctCount} de {studentTickets.length}
            </p>

            {studentTickets.map((ticket) => (
              <article
                key={ticket.id}
                style={{
                  backgroundColor: "#ffffff",
                  padding: 20,
                  marginTop: 16,
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                }}
              >
                <h4>
                  {experiences[ticket.activityId] ??
                    ticket.activityId}
                </h4>

                <p>
                  <strong>Pregunta:</strong>{" "}
                  {ticket.questionText}
                </p>

                <p>
                  <strong>Respuesta:</strong>{" "}
                  {ticket.studentAnswer}
                </p>

                <p>
                  <strong>Resultado numérico:</strong>{" "}
                  {ticket.isCorrect
                    ? "Correcto"
                    : "Incorrecto"}
                </p>

                <p>
                  <strong>Justificación:</strong>{" "}
                  {ticket.justification}
                </p>

                <p>
                  <strong>Revisión pedagógica:</strong>{" "}
                  Pendiente de validación docente.
                </p>

                <small>
                  Registrado:{" "}
                  {new Date(
                    ticket.createdAt
                  ).toLocaleString("es-CL")}
                </small>
              </article>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 24,
              backgroundColor: "#eff6ff",
              borderRadius: 12,
            }}
          >
            <h3>Monitoreo de habilidades matemáticas</h3>

            <p>
              Los tickets permiten observar respuestas
              y argumentos, pero todavía no proporcionan
              una evaluación completa de cada habilidad.
            </p>

            {skills.map((skill) => (
              <p key={skill}>
                <strong>{skill}:</strong>{" "}
                Pendiente de evaluación con evidencia
                específica.
              </p>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 24,
              borderRadius: 12,
              backgroundColor: "#f8fafc",
            }}
          >
            <h3>Retroalimentación docente</h3>

            <p>
              Revise la respuesta y la justificación
              del estudiante antes de determinar su
              nivel de logro.
            </p>

            <p>
              <strong>Decisión pedagógica sugerida:</strong>{" "}
              Solicitar que explique el procedimiento,
              compruebe la igualdad y represente
              la situación mediante un modelo matemático.
            </p>
          </div>
        </>
      )}

      <p style={{ fontSize: 14, color: "#64748b" }}>
        Vista de desarrollo. El acceso a datos reales
        requiere autenticación docente antes de
        publicar la aplicación.
      </p>
    </section>
  );
}
