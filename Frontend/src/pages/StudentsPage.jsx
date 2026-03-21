import { useEffect, useState } from "react";
import {
  apiGetStudents, apiAddStudent, apiUpdateStudent, apiDeleteStudent,
} from "../api/services";
import { useToast } from "../hooks/useToast";
import { initials, colorFor } from "../utils/helpers";

export default function StudentsPage() {
  const [students,  setStudents]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const { toast, ToastContainer } = useToast();

  const load = async () => {
    try {
      setStudents(await apiGetStudents());
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!name.trim() || !roll.trim()) { toast("Fill in both fields.", "error"); return; }
    try {
      const color   = colorFor(students.length);
      const student = await apiAddStudent({ name: name.trim(), roll: roll.trim(), color });
      setStudents((prev) => [...prev, student].sort((a, b) => a.name.localeCompare(b.name)));
      setName(""); setRoll(""); setShowModal(false);
      toast(`${name} added!`, "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleFreeze = async (s) => {
    const next = s.status === "frozen" ? "active" : "frozen";
    try {
      const updated = await apiUpdateStudent(s._id, { status: next });
      setStudents((prev) => prev.map((st) => (st._id === s._id ? updated : st)));
      toast(`${s.name} ${next === "frozen" ? "frozen" : "unfrozen"}.`, next === "frozen" ? "info" : "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Remove ${s.name}? This cannot be undone.`)) return;
    try {
      await apiDeleteStudent(s._id);
      setStudents((prev) => prev.filter((st) => st._id !== s._id));
      toast(`${s.name} removed.`, "error");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="sec-head">
        <h2>All Students</h2>
        <button className="btn btn-dark" onClick={() => setShowModal(true)}>+ Add Student</button>
      </div>

      <table className="students-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Roll No.</th>
            <th>Status</th>
            <th>Coord. Sessions</th>
            <th>Total Sessions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const isFrozen = s.status === "frozen";
            return (
              <tr key={s._id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="s-av" style={{ background: s.color }}>{initials(s.name)}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{s.roll}</div>
                    </div>
                  </div>
                </td>
                <td>{s.roll}</td>
                <td>
                  <span className={`badge ${isFrozen ? "badge-frozen" : "badge-active"}`}>
                    {isFrozen ? "❄ Frozen" : "● Active"}
                  </span>
                </td>
                <td><span className="badge badge-coord">⭐ {s.coordSessions || 0}x</span></td>
                <td>{s.totalSessions || 0}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn freeze" title={isFrozen ? "Unfreeze" : "Freeze"} onClick={() => handleFreeze(s)}>
                      {isFrozen ? "▶" : "❄"}
                    </button>
                    <button className="icon-btn danger" title="Remove" onClick={() => handleDelete(s)}>✕</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Student</h3>
            <p>New student will be included in future group shuffles.</p>
            <div className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun Rajan" autoFocus />
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input type="text" value={roll} onChange={(e) => setRoll(e.target.value)} placeholder="e.g. CS2219"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-dark"    onClick={handleAdd}>Add Student</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
}