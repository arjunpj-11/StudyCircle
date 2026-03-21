import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiGetStudents, apiGetAttendance, apiSaveAttendance,
  apiGetMeetLinks, apiSaveSession,
} from "../api/services";
import { useToast } from "../hooks/useToast";
import { todayKey, initials, generateGroupChunks, pickCoordinator, shuffle } from "../utils/helpers";

export default function AttendancePage() {
  const [students,   setStudents]   = useState([]);
  const [attendance, setAtt]        = useState({});
  const [meetLinks,  setMeetLinks]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [isMobile,   setIsMobile]   = useState(false);
  const { toast, ToastContainer }   = useToast();
  const navigate = useNavigate();
  const dateKey  = todayKey();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [studs, attDoc, links] = await Promise.all([
          apiGetStudents(),
          apiGetAttendance(dateKey).catch(() => null),
          apiGetMeetLinks(),
        ]);
        setStudents(studs);
        setMeetLinks(links);
        const map = {};
        studs.forEach((s) => {
          const saved = attDoc?.records?.find((r) => String(r.studentId) === String(s._id));
          map[s._id] = saved ? saved.status : (s.status === "frozen" ? "F" : "A");
        });
        setAtt(map);
      } catch (err) {
        toast(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateKey]);

  const toggle  = (id) => setAtt((prev) => ({ ...prev, [id]: prev[id] === "P" ? "A" : "P" }));
  const markAll = (val) => {
    const next = {};
    students.filter((s) => s.status !== "frozen").forEach((s) => (next[s._id] = val));
    setAtt((prev) => ({ ...prev, ...next }));
  };

  const handleSave = async () => {
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: s.status === "frozen" ? "F" : attendance[s._id] || "A",
      }));
      await apiSaveAttendance(dateKey, records);
      toast("Attendance saved!", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleGenerate = async () => {
    const present = students.filter(
      (s) => s.status !== "frozen" && attendance[s._id] === "P"
    );
    if (present.length < 3) { toast("Need at least 3 present students.", "error"); return; }
    const chunks   = generateGroupChunks(present);
    const linkPool = shuffle([...meetLinks]);
    const groups   = chunks.map((members, i) => {
      const coord = pickCoordinator(members);
      const link  = linkPool[i % linkPool.length];
      return {
        id:            i + 1,
        members:       members.map((m) => ({ studentId: m._id, name: m.name, roll: m.roll, color: m.color })),
        coordinatorId: coord._id,
        meetLink:      link?.url || "https://meet.google.com/",
        isFour:        members.length === 4,
      };
    });
    try {
      await apiSaveSession(dateKey, groups, false);
      toast(`${groups.length} groups generated!`, "success");
      navigate("/admin/groups");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;

  const active  = students.filter((s) => s.status !== "frozen");
  const present = active.filter((s) => attendance[s._id] === "P");
  const frozen  = students.filter((s) => s.status === "frozen");

  return (
    <>
      <style>{`
        .att-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }
        @media (max-width: 900px) {
          .att-stats-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .att-stats-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }
        .att-sec-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .att-sec-head h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.3rem;
        }
        .att-sec-head-right {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .att-sec-head { flex-direction: column; align-items: flex-start; }
          .att-sec-head-right { width: 100%; }
          .att-sec-head-right .btn { flex: 1; justify-content: center; font-size: 0.75rem; padding: 8px 10px; }
        }
        .att-grid-responsive {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 10px;
          margin-bottom: 36px;
        }
        @media (max-width: 640px) {
          .att-grid-responsive {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .att-grid-responsive {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .att-generate-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }
        @media (max-width: 640px) {
          .att-generate-row { justify-content: stretch; }
          .att-generate-row .btn { width: 100%; justify-content: center; }
        }
        .stat-card-compact .stat-value {
          font-size: 1.8rem;
        }
        @media (max-width: 480px) {
          .stat-card-compact { padding: 14px 16px; }
          .stat-card-compact .stat-value { font-size: 1.5rem; }
          .stat-card-compact .stat-label { font-size: 0.6rem; }
          .stat-card-compact .stat-sub   { font-size: 0.65rem; }
        }
      `}</style>

      {/* Stats */}
      <div className="att-stats-row">
        {[
          { label: "Total Students", value: students.length, sub: "enrolled",        icon: "👥", bg: "#eae6de" },
          { label: "Present Today",  value: present.length,  sub: "marked present",  icon: "✓",  bg: "#d4f0e0", color: "var(--green)" },
          { label: "Absent",         value: active.length - present.length, sub: "not marked", icon: "✗", bg: "#fde8d8", color: "var(--accent)" },
          { label: "Frozen",         value: frozen.length,   sub: "paused accounts", icon: "❄",  bg: "#dde9f8", color: "var(--blue)" },
        ].map(({ label, value, sub, icon, bg, color }) => (
          <div className="stat-card stat-card-compact" key={label}>
            <div className="stat-card-top">
              <div className="stat-label">{label}</div>
              <div className="stat-icon" style={{ background: bg }}>{icon}</div>
            </div>
            <div className="stat-value" style={color ? { color } : {}}>{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="att-sec-head">
        <h2>Mark Attendance</h2>
        <div className="att-sec-head-right">
          <button className="btn btn-outline" onClick={() => markAll("P")}>✓ Mark All Present</button>
          <button className="btn btn-outline" onClick={() => markAll("A")}>✗ Clear All</button>
          <button className="btn btn-dark"    onClick={handleSave}>💾 Save</button>
        </div>
      </div>

      {/* Grid */}
      <div className="att-grid-responsive">
        {[...active, ...frozen].map((s) => {
          const isFrozen  = s.status === "frozen";
          const isPresent = attendance[s._id] === "P";
          return (
            <div key={s._id} className={`att-card ${isFrozen ? "frozen" : isPresent ? "present" : "absent"}`}>
              <div className="att-av" style={{ background: s.color }}>{initials(s.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="att-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                <div className="att-roll">
                  {s.roll} {isFrozen && <span className="frozen-tag">Frozen</span>}
                </div>
              </div>
              {isFrozen ? (
                <button className="att-toggle frozen-btn">❄</button>
              ) : (
                <button
                  className={`att-toggle ${isPresent ? "mark-absent" : "mark-present"}`}
                  onClick={() => toggle(s._id)}
                >
                  {isPresent ? "✓" : "○"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Generate button */}
      <div className="att-generate-row">
        <button className="btn btn-accent" onClick={handleGenerate}>
          ↺ Shuffle &amp; Generate Groups
        </button>
      </div>

      <ToastContainer />
    </>
  );
}