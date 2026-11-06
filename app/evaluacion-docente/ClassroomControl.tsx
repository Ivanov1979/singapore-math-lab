"use client";

import { useEffect, useState } from "react";

export default function ClassroomControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch("/api/classroom/status", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudo consultar el estado.");
        }

        const data = await response.json();
        setIsOpen(data.isOpen === true);
      } catch {
        setError("No se pudo consultar el estado de la clase.");
      } finally {
        setLoading(false);
      }
    }

    void loadStatus();
  }, []);

  async function toggleClassroom() {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/classroom/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !isOpen }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado.");
      }

      const data = await response.json();
      setIsOpen(data.isOpen === true);
    } catch {
      setError("No se pudo cambiar el estado de la clase.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      style={{
        padding: "24px",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        marginBottom: "24px",
      }}
    >
      <h2>Control de la clase</h2>

      <p>
        Estado:{" "}
        <strong>
          {loading ? "Consultando..." : isOpen ? "ABIERTA" : "CERRADA"}
        </strong>
      </p>

      <p>
        {isOpen
          ? "La clase está habilitada para registrar respuestas."
          : "La clase está cerrada para registrar respuestas."}
      </p>

      <button
        type="button"
        onClick={toggleClassroom}
        disabled={loading || saving || Boolean(error)}
        style={{
          padding: "12px 20px",
          backgroundColor: isOpen ? "#b91c1c" : "#166534",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading || saving ? "wait" : "pointer",
        }}
      >
        {saving
          ? "Guardando..."
          : isOpen
            ? "Cerrar clase"
            : "Abrir clase"}
      </button>

      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    </section>
  );
}
