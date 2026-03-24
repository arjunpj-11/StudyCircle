import { useEffect, useState } from "react";
import {
  apiGetSession, apiSaveSession, apiPublishSession,
  apiGetStudents, apiGetMeetLinks, apiIncrementSessions,
  apiGetAttendance,
} from "../api/services";
import { useToast } from "../hooks/useToast";
import { todayKey, initials, generateGroupChunks, pickCoordinator, shuffle } from "../utils/helpers";

export default function GroupsPage() {
  const [session,    setSession]    = useState(null);
  const [students,   setStudents]   = useState([]);
  const [meetLinks,  setMeetLinks]  = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading,    setLoading]    = useState(true);
  const { toast, ToastContainer }   = useToast();
  const dateKey = todayKey();

  const load = async () => {
    try {
      const [sess, studs, links, attDoc] = await Promise.all([
        apiGetSession(dateKey).catch(() => null),
        apiGetStudents(),
        apiGetMeetLinks(),
        apiGetAttendance(dateKey).catch(() => null),
      ]);
      setSession(sess);
      setStudents(studs);
      setMeetLinks(links);
      const map = {};
      studs.forEach((s) => {
        const saved = attDoc?.records?.find((r) => String(r.studentId) === String(s._id));
        map[s._id] = saved ? saved.status : (s.status === "frozen" ? "F" : "A");
      });
      setAttendance(map);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [dateKey]);

  const groups    = (session?.groups || []).slice().sort((a, b) => a.id - b.id);
  const published = session?.published || false;
  const groupSize = session?.groupSize || 3;

  const handleReshuffle = async () => {
    const active = students.filter(
      (s) => s.status !== "frozen" && attendance[s._id] === "P"
    );
    if (active.length < groupSize) {
      toast(`Need at least ${groupSize} present students.`, "error");
      return;
    }
    const chunks    = generateGroupChunks(active, groupSize);
    const linkPool  = shuffle([...meetLinks]);
    const newGroups = chunks.map((members, i) => {
      const coord = pickCoordinator(members);
      const link  = linkPool[i % linkPool.length];
      return {
        id:            i + 1,
        members:       members.map((m) => ({ studentId: m._id, name: m.name, roll: m.roll, color: m.color })),
        coordinatorId: coord._id,
        meetLink:      link?.url || "https://meet.google.com/",
        isFour:        members.length === groupSize + 1,
      };
    });
    try {
      const updated = await apiSaveSession(dateKey, newGroups, false, groupSize);
      setSession(updated);
      toast("Groups reshuffled!", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handlePublish = async () => {
    try {
      const updated = await apiPublishSession(dateKey);
      setSession(updated);
      await apiIncrementSessions(groups);
      toast("Groups published! Students can now see their groups.", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleSwapCoord = async (groupId) => {
    const group  = groups.find((g) => g.id === groupId);
    if (!group) return;
    const others = group.members.filter((m) => String(m.studentId) !== String(group.coordinatorId));
    const sorted = [...others].sort((a, b) => {
      const sa = students.find((s) => String(s._id) === String(a.studentId));
      const sb = students.find((s) => String(s._id) === String(b.studentId));
      return (sa?.coordSessions || 0) - (sb?.coordSessions || 0);
    });
    const newCoord = sorted[0];
    const updated  = groups.map((g) =>
      g.id === groupId ? { ...g, coordinatorId: newCoord.studentId } : g
    );
    try {
      const res = await apiSaveSession(dateKey, updated, published, groupSize);
      setSession(res);
      toast("Coordinator reassigned.", "info");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;

  return (
    <>
      {/* Coordinator legend */}
      <div className="coord-legend">
        <div className="coord-legend-icon">⭐</div>
        <div>
          <h4>Coordinator rotation</h4>
          <p>The student with fewest coordinator sessions leads. The system rotates so everyone gets a turn.</p>
        </div>
      </div>

      {/* Publish banner */}
      <div className={`publish-banner${published ? " published" : ""}`}>
        <div>
          <h3>{published ? "✓ Published — students can see their groups" : "Groups are ready — publish to students?"}</h3>
          <p>{published ? "Groups are live. Students can open their Meet links." : "Once published, students can see their groups and join their Meet link."}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {!published && (
            <button
              className="btn btn-outline"
              style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
              onClick={handleReshuffle}
            >↺ Reshuffle</button>
          )}
          <button className="btn btn-green" onClick={handlePublish} disabled={published}>
            {published ? "Published ✓" : "Publish to Students →"}
          </button>
        </div>
      </div>

      {/* Groups header */}
      <div className="sec-head">
        <h2>Today's Groups</h2>
        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
          {groups.length} groups · {groups.reduce((s, g) => s + g.members.length, 0)} students
          {groups.some((g) => g.isFour) && (
            <span style={{ color: "var(--purple)" }}>
              {" "}· ★ {groups.filter((g) => g.isFour).length} group(s) of {groupSize + 1}
            </span>
          )}
        </span>
      </div>

      {!groups.length ? (
        <div className="empty-records" style={{ marginTop: 24 }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>👥</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No groups yet</div>
          <div>Go to Attendance, mark students present, then click Shuffle &amp; Generate Groups.</div>
        </div>
      ) : (
        <div className="groups-grid-admin">
          {groups.map((group) => {
            const shortLink = (group.meetLink || "").replace("https://meet.google.com/", "meet.google.com/");
            return (
              <div key={group.id} className={`group-card-admin${group.isFour ? " has-four" : ""}`}>
                <div className="gca-head">
                  <div className="gca-title">
                    Group {group.id}
                    {group.isFour && <span className="four-badge">★ {groupSize + 1} members</span>}
                  </div>
                  <a href={group.meetLink} target="_blank" rel="noreferrer" className="gca-meet">
                    🔗 {(shortLink || "").slice(0, 26)}…
                  </a>
                </div>

                <div className="gca-members">
                  {group.members.map((m) => {
                    const isCoord = String(m.studentId) === String(group.coordinatorId);
                    return (
                      <div key={m.studentId} className={`gca-member${isCoord ? " coordinator" : ""}`}>
                        <div className="gca-av" style={{ background: m.color }}>{initials(m.name)}</div>
                        <div className="gca-member-name">
                          {m.name}
                          <div className="gca-member-sub">{m.roll}</div>
                        </div>
                        {isCoord && <span className="coord-badge">⭐ Coord</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="gca-foot">
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: "0.78rem", padding: "7px 12px" }}
                    onClick={() => handleSwapCoord(group.id)}
                  >↺ Swap Coordinator</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ToastContainer />
    </>
  );
}