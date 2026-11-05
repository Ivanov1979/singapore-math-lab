
"use client";

import { useEffect, useState, type FormEvent } from "react";

type Experience = "experiencia-2" | "experiencia-3";

type ExitTicketFormProps = {
    experience: Experience;
    selectedStudentCode?: string;
};

type Student = {
    code: string;
    firstName: string | null;
    lastName: string | null;
};

const tickets = {
    "experiencia-2": {
        title: "Ticket de salida — Experiencia 2",
        question:
            "Un pirata recibe 8 monedas y ahora tiene 23. ¿Cuántas tenía inicialmente?",
    },
    "experiencia-3": {
        title: "Ticket de salida — Experiencia 3",
        question:
            "Una caja tenía lápices. Se retiran 6 y quedan 17. ¿Cuántos había inicialmente?",
    },
};

export default function ExitTicketForm({
    experience,
    selectedStudentCode,
}: ExitTicketFormProps) {
    const fixedStudentCode = selectedStudentCode?.trim() ?? "";
    const hasSelectedStudent = Boolean(fixedStudentCode);

    const [studentCode, setStudentCode] = useState("");
    const [studentSearch, setStudentSearch] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [searching, setSearching] = useState(false);

    const [studentAnswer, setStudentAnswer] = useState("");
    const [justification, setJustification] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);

    const [completedStudents, setCompletedStudents] = useState<string[]>([]);

    const ticket = tickets[experience];

    const effectiveStudentCode = hasSelectedStudent
        ? fixedStudentCode
        : studentCode;

    useEffect(() => {
        setStudentCode("");
        setStudentSearch("");
        setStudents([]);
        setStudentAnswer("");
        setJustification("");
        setMessage("");
        setCompleted(false);
        setCompletedStudents([]);
    }, [experience, selectedStudentCode]);

    useEffect(() => {
        if (hasSelectedStudent || completed || studentCode) {
            return;
        }

        const query = studentSearch.trim();

        if (query.length < 3) {
            setStudents([]);
            setSearching(false);
            return;
        }

        const controller = new AbortController();

        const timeout = setTimeout(async () => {
            setSearching(true);

            try {
                const response = await fetch(
                    `/api/students/search?q=${encodeURIComponent(query)}`,
                    {
                        signal: controller.signal,
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error("No se pudo buscar estudiantes.");
                }

                const data: { students: Student[] } =
                    await response.json();

                if (!controller.signal.aborted) {
                    setStudents(data.students ?? []);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setStudents([]);
                    setMessage("No se pudo realizar la búsqueda.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setSearching(false);
                }
            }
        }, 350);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [
        studentSearch,
        studentCode,
        completed,
        hasSelectedStudent,
    ]);

    function selectStudent(student: Student) {
        if (completedStudents.includes(student.code)) {
            setMessage("Este estudiante ya completó el ticket.");
            return;
        }

        setStudentCode(student.code);
        setStudentSearch(
            `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()
        );
        setStudents([]);
        setMessage("");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting || completed) return;

        if (!effectiveStudentCode) {
            setMessage("Selecciona tu nombre antes de continuar.");
            return;
        }

        if (!studentAnswer.trim() || !justification.trim()) {
            setMessage("Completa la respuesta y su justificación.");
            return;
        }

        setSubmitting(true);
        setMessage("");

        try {
            const response = await fetch("/api/exit-tickets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    studentCode: effectiveStudentCode,
                    activityId: experience,
                    studentAnswer: studentAnswer.trim(),
                    justification: justification.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "No se pudo guardar.");
            }

            setCompletedStudents((previous) =>
                previous.includes(effectiveStudentCode)
                    ? previous
                    : [...previous, effectiveStudentCode]
            );

            setCompleted(true);
            setMessage("¡Tu ticket de salida fue registrado!");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error inesperado."
            );
        } finally {
            setSubmitting(false);
        }
    }

    function resetForNextStudent() {
        setStudentCode("");
        setStudentSearch("");
        setStudents([]);
        setStudentAnswer("");
        setJustification("");
        setMessage("");
        setCompleted(false);
    }

    return (
        <section className="mx-auto max-w-xl rounded-2xl border-4 border-blue-600 bg-blue-50 p-6 text-slate-900 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-blue-900">
                {ticket.title}
            </h2>

            <p className="mb-6">{ticket.question}</p>

            {!hasSelectedStudent && completedStudents.length > 0 && (
                <p className="mb-4 rounded-lg bg-white p-3 font-semibold text-blue-900">
                    Tickets registrados en esta sesión:{" "}
                    {completedStudents.length}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {hasSelectedStudent ? (
                    <div className="rounded-lg border border-green-300 bg-green-50 p-3">
                        <p className="font-semibold text-green-800">
                            ✓ Estudiante identificado
                        </p>
                        <p className="text-sm text-green-700">
                            Puedes completar tu ticket individual.
                        </p>
                    </div>
                ) : (
                    <div>
                        <label
                            htmlFor={`studentSearch-${experience}`}
                            className="mb-1 block font-semibold"
                        >
                            Buscar mi nombre
                        </label>

                        <input
                            id={`studentSearch-${experience}`}
                            type="text"
                            autoComplete="off"
                            required
                            value={studentSearch}
                            disabled={submitting || completed}
                            onChange={(event) => {
                                setStudentSearch(event.target.value);
                                setStudentCode("");
                                setStudents([]);
                                setMessage("");
                            }}
                            placeholder="Escribe tu nombre o apellido"
                            className="w-full rounded-lg border-2 border-blue-300 bg-white p-3"
                        />

                        {searching && (
                            <p className="mt-2 text-sm" role="status">
                                Buscando estudiantes...
                            </p>
                        )}

                        {students.length > 0 && !studentCode && (
                            <ul className="mt-2 overflow-hidden rounded-lg border-2 border-blue-200 bg-white">
                                {students.map((student) => {
                                    const alreadyCompleted =
                                        completedStudents.includes(student.code);

                                    return (
                                        <li key={student.code}>
                                            <button
                                                type="button"
                                                disabled={alreadyCompleted}
                                                onClick={() => selectStudent(student)}
                                                className="w-full border-b border-blue-100 p-3 text-left hover:bg-blue-100 disabled:opacity-50"
                                            >
                                                {student.firstName} {student.lastName}
                                                {alreadyCompleted && " — Ticket registrado"}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {studentCode && (
                            <p className="mt-2 font-semibold text-green-700">
                                ✓ Estudiante seleccionado: {studentSearch}
                            </p>
                        )}
                    </div>
                )}

                <div>
                    <label
                        htmlFor={`studentAnswer-${experience}`}
                        className="mb-1 block font-semibold"
                    >
                        Respuesta numérica
                    </label>
                    <input
                        id={`studentAnswer-${experience}`}
                        type="text"
                        inputMode="numeric"
                        required
                        value={studentAnswer}
                        disabled={submitting || completed}
                        onChange={(event) =>
                            setStudentAnswer(event.target.value)
                        }
                        className="w-full rounded-lg border-2 border-blue-300 bg-white p-3"
                        placeholder="Escribe tu respuesta"
                    />
                </div>

                <div>
                    <label
                        htmlFor={`justification-${experience}`}
                        className="mb-1 block font-semibold"
                    >
                        Explica cómo resolviste el problema y comprueba
                        tu respuesta.
                    </label>
                    <textarea
                        id={`justification-${experience}`}
                        required
                        maxLength={2000}
                        value={justification}
                        disabled={submitting || completed}
                        onChange={(event) =>
                            setJustification(event.target.value)
                        }
                        className="w-full rounded-lg border-2 border-blue-300 bg-white p-3"
                        rows={4}
                        placeholder="Explica tu procedimiento..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={
                        submitting ||
                        completed ||
                        !effectiveStudentCode
                    }
                    className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                    {submitting
                        ? "Guardando..."
                        : completed
                            ? "Ticket enviado"
                            : "Enviar ticket"}
                </button>

                {message && (
                    <p
                        role="status"
                        aria-live="polite"
                        className={`mt-3 font-semibold ${completed ? "text-green-700" : "text-red-700"
                            }`}
                    >
                        {message}
                    </p>
                )}
            </form>

            {completed && !hasSelectedStudent && (
                <button
                    type="button"
                    onClick={resetForNextStudent}
                    className="mt-4 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white"
                >
                    Siguiente estudiante →
                </button>
            )}
        </section>
    );
}
