"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function TeacherLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/teacher/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                setError("Usuario o contraseña incorrectos.");
                return;
            }

            router.replace("/evaluacion-docente");
            router.refresh();
        } catch {
            setError("No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{
            maxWidth: 420,
            margin: "80px auto",
            padding: 24,
            fontFamily: "Arial, sans-serif",
        }}>
            <h1>Acceso Docente</h1>
            <p>Singapore Math Lab — Evaluación Docente</p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Usuario</label>
                <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        display: "block",
                        width: "100%",
                        padding: 12,
                        marginBottom: 16,
                        boxSizing: "border-box",
                    }}
                />

                <label htmlFor="password">Contraseña</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        display: "block",
                        width: "100%",
                        padding: 12,
                        marginBottom: 16,
                        boxSizing: "border-box",
                    }}
                />

                {error && (
                    <p role="alert" style={{ color: "#b91c1c" }}>
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 14,
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: 0,
                        borderRadius: 8,
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Ingresando..." : "Ingresar"}
                </button>
            </form>
        </main>
    );
}
