"use client";

import { useEffect, useState } from "react";

type Student = { id: string; code: string };
type SchoolClass = { id: string; name: string; grade: string; students: Student[] };
const STORAGE_KEY = "evaluacion-docente-demo-classes-v1";
const initialClasses: SchoolClass[] = [
  { id: "demo-5a", name: "5° A (demostración)", grade: "5° básico", students: [
    { id: "a", code: "Estudiante 01" }, { id: "b", code: "Estudiante 02" },
    { id: "c", code: "Estudiante 03" }, { id: "d", code: "Estudiante 04" },
  ] },
];
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function ClassManager() {
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses);
  const [activeId, setActiveId] = useState("demo-5a");
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("5° básico");
  const [error, setError] = useState("");
  const [newStudent, setNewStudent] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.classes) && parsed.classes.length > 0) {
          setClasses(parsed.classes);
          setActiveId(parsed.activeId ?? parsed.classes[0].id);
        }
      }
    } catch { /* Ignore invalid saved demonstration data. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify({ classes, activeId }));
  }, [classes, activeId, ready]);

  const current = classes.find((item) => item.id === activeId) ?? classes[0];

  function beginCreate() { setEditing(false); setName(""); setGrade("5° básico"); setError(""); }
  function beginEdit() { setEditing(true); setName(current.name); setGrade(current.grade); setError(""); }
  function saveClass() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Ingrese el nombre de la clase."); return; }
    if (editing) {
      setClasses((items) => items.map((item) => item.id === current.id ? { ...item, name: trimmed, grade } : item));
    } else {
      const created: SchoolClass = { id: makeId(), name: trimmed, grade, students: [] };
      setClasses((items) => [...items, created]);
      setActiveId(created.id);
    }
    setName(""); setEditing(false); setError("");
  }
  function addStudent() {
    const code = newStudent.trim();
    if (!code || !current) return;
    if (current.students.some((student) => student.code.toLowerCase() === code.toLowerCase())) {
      setError("Ese código ya existe en la clase."); return;
    }
    setClasses((items) => items.map((item) => item.id === current.id ? {
      ...item, students: [...item.students, { id: makeId(), code }],
    } : item));
    setNewStudent(""); setError("");
  }
  function removeStudent(id: string) {
    setClasses((items) => items.map((item) => item.id === current.id ? {
      ...item, students: item.students.filter((student) => student.id !== id),
    } : item));
  }
  function removeClass() {
    if (classes.length <= 1) { setError("Debe conservar al menos una clase."); return; }
    if (!window.confirm(`¿Eliminar la clase «${current.name}» de esta demostración?`)) return;
    const remaining = classes.filter((item) => item.id !== current.id);
    setClasses(remaining); setActiveId(remaining[0].id); setEditing(false); setError("");
  }
  const fieldStyle = { padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, color: "#111827", background: "white" };
  const buttonStyle = { padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", cursor: "pointer", background: "#f8fafc", color: "#111827" };

  return (
    <section style={{ marginTop: 40, padding: 24, border: "1px solid #e2e8f0", borderRadius: 12 }}>
      <h2>Gestión de clases (demostración)</h2>
      <p>Crear y editar clases con códigos ficticios. Los cambios se guardan solo en este navegador.</p>
      <label htmlFor="class-selector" style={{ display: "block", fontWeight: 700 }}>Clase activa</label>
      <select id="class-selector" value={current.id} onChange={(event) => { setActiveId(event.target.value); setEditing(false); setName(""); setError(""); }} style={{ ...fieldStyle, marginTop: 8, minWidth: 230, maxWidth: "100%" }}>
        {classes.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.grade}</option>)}
      </select>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        <button type="button" style={buttonStyle} onClick={beginCreate}>Crear clase</button>
        <button type="button" style={buttonStyle} onClick={beginEdit}>Editar clase</button>
        <button type="button" style={buttonStyle} onClick={removeClass}>Eliminar clase</button>
      </div>
      <div style={{ marginTop: 18, padding: 16, background: "#f8fafc", borderRadius: 10 }}>
        <h3>{editing ? "Editar clase" : "Crear clase"}</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <label>Nombre de la clase<br/><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej.: 5° B" style={fieldStyle} maxLength={60}/></label>
          <label>Nivel<br/><select value={grade} onChange={(event) => setGrade(event.target.value)} style={fieldStyle}>{["4° básico", "5° básico", "6° básico", "7° básico", "8° básico"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <button type="button" onClick={saveClass} style={{ ...buttonStyle, background: "#2563eb", color: "white" }}>Guardar {editing ? "cambios" : "clase"}</button>
        </div>
      </div>
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      <h3 style={{ marginTop: 24 }}>Estudiantes de {current.name}</h3>
      <p>Utilice códigos anónimos. No ingrese nombres reales.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input aria-label="Código del estudiante" value={newStudent} onChange={(event) => setNewStudent(event.target.value)} placeholder="Estudiante 05" style={fieldStyle} maxLength={60}/>
        <button type="button" onClick={addStudent} style={buttonStyle}>Agregar estudiante</button>
      </div>
      {current.students.length === 0 ? <p>Esta clase todavía no tiene estudiantes.</p> : <ul style={{ marginTop: 18, paddingLeft: 22 }}>
        {current.students.map((student) => <li key={student.id} style={{ marginBottom: 8 }}>{student.code} <button type="button" onClick={() => removeStudent(student.id)} style={{ ...buttonStyle, padding: "4px 8px", marginLeft: 8 }}>Quitar</button></li>)}
      </ul>}
      <p style={{ color: "#64748b", fontSize: 14 }}>Esta gestión de clases es independiente del monitoreo de habilidades existente. La sincronización y la importación CSV/Excel se agregarán después.</p>
    </section>
  );
}
