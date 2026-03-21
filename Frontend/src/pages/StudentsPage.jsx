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
  const [isMobile, setIsMobile] = useState(false);
  const { toast, ToastContainer } = useToast();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
      <style>{`
        .sp-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .sp-head h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.3rem;
        }

        /* ── Table view (≥700px) ── */
        .sp-table-wrap {
          overflow-x: auto;
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
        .sp-table-wrap table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: var(--card);
          font-size: 0.86rem;
        }
        .sp-table-wrap th {
          padding: 12px 18px;
          text-align: left;
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          background: var(--paper);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .sp-table-wrap td {
          padding: 13px 18px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .sp-table-wrap tr:last-child td { border-bottom: none; }
        .sp-table-wrap tr:hover td     { background: var(--paper); }

        /* ── Card view (<700px) ── */
        .sp-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sp-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 14px 16px;
        }
        .sp-card-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .sp-card-info { flex: 1; min-width: 0; }
        .sp-card-name {
          font-weight: 500;
          font-size: 0.92rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sp-card-roll {
          font-size: 0.7rem;
          color: var(--muted);
          margin-top: 2px;
        }
        .sp-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
        .sp-card-stat {
          font-size: 0.72rem;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .sp-card-stat strong {
          color: var(--ink);
          font-weight: 600;
        }
        .sp-card-actions {
          display: flex;
          gap: 6px;
          margin-left: auto;
        }

        /* Modal responsive */
        @media (max-width: 480px) {
          .modal { padding: 24px 18px; }
          .modal-actions { flex-direction: column-reverse; }
          .modal-actions .btn { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Header */}
      <div className="sp-head">
        <h2>All Students</h2>
        <button className="btn btn-dark" onClick={() => setShowModal(true)}>+ Add Student</button>
      </div>

      {/* Table — desktop */}
      {!isMobile ? (
        <div className="sp-table-wrap">
          <table>
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
        </div>
      ) : (
        /* Cards — mobile */
        <div className="sp-cards">
          {students.map((s) => {
            const isFrozen = s.status === "frozen";
            return (
              <div key={s._id} className="sp-card">
                <div className="sp-card-top">
                  <div className="s-av" style={{ background: s.color, width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                    {initials(s.name)}
                  </div>
                  <div className="sp-card-info">
                    <div className="sp-card-name">{s.name}</div>
                    <div className="sp-card-roll">{s.roll}</div>
                  </div>
                  <span className={`badge ${isFrozen ? "badge-frozen" : "badge-active"}`}>
                    {isFrozen ? "❄ Frozen" : "● Active"}
                  </span>
                </div>
                <div className="sp-card-meta">
                  <div className="sp-card-stat">
                    <span>Coord:</span>
                    <strong>{s.coordSessions || 0}x</strong>
                  </div>
                  <div className="sp-card-stat" style={{ marginLeft: 8 }}>
                    <span>Sessions:</span>
                    <strong>{s.totalSessions || 0}</strong>
                  </div>
                  <div className="sp-card-actions">
                    <button className="icon-btn freeze" title={isFrozen ? "Unfreeze" : "Freeze"} onClick={() => handleFreeze(s)}>
                      {isFrozen ? "▶" : "❄"}
                    </button>
                    <button className="icon-btn danger" title="Remove" onClick={() => handleDelete(s)}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
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