import ClassroomControl from "./ClassroomControl";

import { isTeacherAuthenticated } from "@/lib/teacher-auth";

import Link from "next/link";
import SkillResults from "./SkillResults";
import StudentMonitoring from "./StudentMonitoring";

export default async function EvaluacionDocentePage() {
    const authenticated = await isTeacherAuthenticated();

    return (
        <main
            style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "32px 24px 80px",
                fontFamily: "Arial, sans-serif",
                color: "#111827",
                lineHeight: 1.6,
            }}
        >
            <header style={{ marginBottom: 32 }}>
                <h1
                    style={{
                        fontSize: 36,
                        fontWeight: 800,
                        marginBottom: 8,
                    }}
                >
                    Panel de Evaluación Docente
                </h1>

                <h2>Matemática — 5° básico</h2>

                <p>
                    Monitoreo de aprendizajes basado en las respuestas
                    individuales registradas por los estudiantes.
                </p>
            </header>

            <section style={{ marginBottom: 36 }}>
                <h2>Experiencias de aprendizaje</h2>

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 16,
                        marginTop: 16,
                    }}
                >
                    <Link
                        href="/singapore-math-lab"
                        style={{
                            display: "inline-block",
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            padding: "12px 20px",
                            borderRadius: 8,
                            textDecoration: "none",
                            fontWeight: 600,
                        }}
                    >
                        Singapore Math Lab
                    </Link>

                    <Link
                        href="/ludo-matematico"
                        style={{
                            display: "inline-block",
                            backgroundColor: "#0f766e",
                            color: "#ffffff",
                            padding: "12px 20px",
                            borderRadius: 8,
                            textDecoration: "none",
                            fontWeight: 600,
                        }}
                    >
                        Ludo Matemático
                    </Link>
                </div>
            </section>

            {authenticated ? (
                <>
                    <ClassroomControl />
                    <SkillResults />
                    <StudentMonitoring />
                </>
            ) : (
                <section style={{
                    padding: 24,
                    backgroundColor: "#f1f5f9",
                    borderRadius: 12,
                    marginTop: 24
                }}>
                    <h2>Modo demostración</h2>
                    <p>
                        Explora Singapore Math Lab y Ludo Matemático
                        sin iniciar sesión.
                    </p>
                    <p>
                        Los resultados individuales y el control de clases
                        permanecen protegidos.
                    </p>
                </section>
            )}

            <footer
                style={{
                    marginTop: 48,
                    paddingTop: 20,
                    borderTop: "1px solid #e5e7eb",
                    color: "#64748b",
                    fontSize: 14,
                }}
            >
                Evaluación Docente 2026 — Monitoreo formativo
                de Matemática.
            </footer>
        </main>
    );
}
