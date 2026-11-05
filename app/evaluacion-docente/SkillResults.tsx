
"use client";

import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import styles from "./SkillResults.module.css";

type SkillScore = {
    skill: string;
    points: number;
    maxPoints: number;
    responses: number;
    pending: number;
    percentage: number | null;
};

type TicketScore = {
    submitted: number;
    correct: number;
};

type ActivityScores = {
    ludo: SkillScore[];
    singapore: SkillScore[];
};

type TicketScores = {
    experiencia2: TicketScore;
    experiencia3: TicketScore;
};

type StudentResult = {
    id: string;
    code: string;
    name: string;
    grade: number;
    activities: ActivityScores;
    tickets: TicketScores;
};

type Results = {
    global: ActivityScores & { tickets: TicketScores };
    students: StudentResult[];
};

type ActivityKey =
    | "ludo"
    | "singapore"
    | "experiencia2"
    | "experiencia3";

const activityNames: Record<ActivityKey, string> = {
    ludo: "Ludo Matemático",
    singapore: "Singapore Math Lab",
    experiencia2: "Ticket de Salida 2",
    experiencia3: "Ticket de Salida 3",
};

const activityKeys: ActivityKey[] = [
    "ludo",
    "singapore",
    "experiencia2",
    "experiencia3",
];

const skillNames = [
    { key: "REPRESENTAR", name: "Representar" },
    { key: "MODELAR", name: "Modelar" },
    { key: "RESOLVER_PROBLEMAS", name: "Resolver problemas" },
    {
        key: "ARGUMENTAR_COMUNICAR",
        name: "Argumentar y comunicar",
    },
];

function skillPercentage(scores: SkillScore[]): number | null {
    const graded = scores.filter((score) => score.maxPoints > 0);

    const points = graded.reduce(
        (sum, score) => sum + score.points,
        0
    );

    const maximum = graded.reduce(
        (sum, score) => sum + score.maxPoints,
        0
    );

    return maximum > 0
        ? Math.round((points / maximum) * 100)
        : null;
}

function ticketPercentage(ticket: TicketScore): number | null {
    return ticket.submitted > 0
        ? Math.round((ticket.correct / ticket.submitted) * 100)
        : null;
}

function activityPercentage(
    key: ActivityKey,
    activities: ActivityScores,
    tickets: TicketScores
): number | null {
    if (key === "ludo") {
        return skillPercentage(activities.ludo);
    }

    if (key === "singapore") {
        return skillPercentage(activities.singapore);
    }

    return ticketPercentage(tickets[key]);
}

export default function SkillResults() {
    const [results, setResults] = useState<Results | null>(null);
    const [selectedId, setSelectedId] = useState("");
    const [selectedActivities, setSelectedActivities] =
        useState<ActivityKey[]>(activityKeys);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const response = await fetch("/api/teacher/results", {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("No se pudieron cargar los resultados.");
                }

                const data: Results = await response.json();

                if (!cancelled) {
                    setResults(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Error desconocido."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return <p>Cargando gráficos...</p>;
    }

    if (error) {
        return <p role="alert">{error}</p>;
    }

    if (!results) {
        return null;
    }

    const selectedStudent =
        results.students.find(
            (student) => student.id === selectedId
        ) ?? results.students[0];

    const globalActivities: ActivityScores = {
        ludo: results.global.ludo,
        singapore: results.global.singapore,
    };

    const skillData = skillNames.map(({ key, name }) => ({
        name,
        ludo:
            results.global.ludo.find(
                (score) => score.skill === key
            )?.percentage ?? null,
        singapore:
            results.global.singapore.find(
                (score) => score.skill === key
            )?.percentage ?? null,
    }));

    const globalData = selectedActivities.map((key) => ({
        name: activityNames[key],
        porcentaje: activityPercentage(
            key,
            globalActivities,
            results.global.tickets
        ),
    }));

    const studentData = selectedStudent
        ? selectedActivities.map((key) => ({
            name: activityNames[key],
            porcentaje: activityPercentage(
                key,
                selectedStudent.activities,
                selectedStudent.tickets
            ),
        }))
        : [];

    const hasSkillData = skillData.some(
        (item) => item.ludo !== null || item.singapore !== null
    );

    const hasGlobalData = globalData.some(
        (item) => item.porcentaje !== null
    );

    const hasStudentData = studentData.some(
        (item) => item.porcentaje !== null
    );

    function toggleActivity(key: ActivityKey) {
        setSelectedActivities((previous) =>
            previous.includes(key)
                ? previous.filter((item) => item !== key)
                : [...previous, key]
        );
    }

    return (
        <section className={styles.dashboard}>
            <header className={styles.header}>
                <h2>Evaluación Docente — Gráficos de aprendizaje</h2>
                <p>
                    Visualización de resultados registrados y evaluados.
                </p>
            </header>

            <div className={`${styles.panel} ${styles.panelBlue}`}>
                <h3>Seleccionar experiencias</h3>

                <div className={styles.options}>
                    {activityKeys.map((key) => (
                        <label key={key} className={styles.option}>
                            <input
                                type="checkbox"
                                checked={selectedActivities.includes(key)}
                                onChange={() => toggleActivity(key)}
                            />
                            <span>{activityNames[key]}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className={styles.panel}>
                <h3>1. Logro por habilidad matemática</h3>

                {hasSkillData ? (
                    <div className={styles.chart}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={skillData}
                                margin={{
                                    top: 12,
                                    right: 12,
                                    bottom: 18,
                                    left: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    height={65}
                                    angle={-12}
                                    textAnchor="end"
                                    tick={{ fontSize: 11 }}
                                />

                                <YAxis
                                    domain={[0, 100]}
                                    width={45}
                                    tickFormatter={(value: number) => `${value}%`}
                                />

                                <Tooltip
                                    formatter={(value, name) => [
                                        value == null ? "Sin evidencia" : `${value}%`,
                                        String(name),
                                    ]}
                                />

                                <Legend />

                                <Bar
                                    dataKey="ludo"
                                    name="Ludo (colaborativo)"
                                    fill="#2563eb"
                                    radius={[5, 5, 0, 0]}
                                    maxBarSize={48}
                                />

                                <Bar
                                    dataKey="singapore"
                                    name="Singapore (individual)"
                                    fill="#0d9488"
                                    radius={[5, 5, 0, 0]}
                                    maxBarSize={48}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className={styles.note}>
                        No hay habilidades evaluadas todavía.
                    </p>
                )}
            </div>

            <div className={styles.panel}>
                <h3>2. Resultados globales por experiencia</h3>

                {hasGlobalData ? (
                    <div className={styles.chart}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={globalData}
                                layout="vertical"
                                margin={{
                                    top: 8,
                                    right: 25,
                                    bottom: 8,
                                    left: 15,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />

                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    tickFormatter={(value: number) => `${value}%`}
                                />

                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={155}
                                    tick={{ fontSize: 12 }}
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        value == null ? "Sin evidencia" : `${value}%`
                                    }
                                />

                                <Bar
                                    dataKey="porcentaje"
                                    name="Logro"
                                    fill="#2563eb"
                                    radius={[0, 6, 6, 0]}
                                    maxBarSize={42}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className={styles.note}>
                        No hay resultados evaluados en las experiencias
                        seleccionadas.
                    </p>
                )}
            </div>

            <div className={styles.panel}>
                <h3>3. Resultados individuales</h3>

                {results.students.length === 0 ? (
                    <p className={styles.note}>
                        Aún no hay estudiantes registrados.
                    </p>
                ) : (
                    <>
                        <label
                            htmlFor="student-results"
                            className={styles.fieldLabel}
                        >
                            Seleccionar estudiante
                        </label>

                        <select
                            id="student-results"
                            className={styles.select}
                            value={selectedStudent?.id ?? ""}
                            onChange={(event) =>
                                setSelectedId(event.target.value)
                            }
                        >
                            {results.students.map((student) => (
                                <option
                                    key={student.id}
                                    value={student.id}
                                >
                                    {student.name} ({student.code})
                                </option>
                            ))}
                        </select>

                        {selectedStudent && (
                            <>
                                <p className={styles.studentName}>
                                    {selectedStudent.name} —{" "}
                                    {selectedStudent.grade}° básico
                                </p>

                                {hasStudentData ? (
                                    <div className={styles.chart}>
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={studentData}
                                                layout="vertical"
                                                margin={{
                                                    top: 8,
                                                    right: 25,
                                                    bottom: 8,
                                                    left: 15,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    horizontal={false}
                                                />

                                                <XAxis
                                                    type="number"
                                                    domain={[0, 100]}
                                                    tickFormatter={(value: number) =>
                                                        `${value}%`
                                                    }
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    width={155}
                                                    tick={{ fontSize: 12 }}
                                                />

                                                <Tooltip
                                                    formatter={(value) =>
                                                        value == null
                                                            ? "Sin evidencia"
                                                            : `${value}%`
                                                    }
                                                />

                                                <Bar
                                                    dataKey="porcentaje"
                                                    name="Logro"
                                                    fill="#0d9488"
                                                    radius={[0, 6, 6, 0]}
                                                    maxBarSize={42}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p className={styles.note}>
                                        Este estudiante no tiene resultados evaluados
                                        en las experiencias seleccionadas.
                                    </p>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            <p className={styles.note}>
                Las actividades pendientes no se consideran como 0%.
                Los tickets representan únicamente la corrección numérica;
                sus justificaciones requieren evaluación docente.
                Ludo es evidencia colaborativa y no debe interpretarse
                como una evaluación individual independiente.
                Los tickets enviados pueden incluir intentos repetidos.
            </p>
        </section>
    );
}






