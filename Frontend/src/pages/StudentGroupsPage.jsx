import { useEffect, useState, useRef } from "react";
import { apiGetPublicSession } from "../api/services";
import { todayKey, initials } from "../utils/helpers";

export default function StudentGroupsPage() {
  const [session, setSession] = useState(undefined);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const intervalRef = useRef(null);
  const dateKey = todayKey();

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetch = () =>
      apiGetPublicSession(dateKey)
        .then(setSession)
        .catch(() => setSession(null));

    fetch();
    intervalRef.current = setInterval(fetch, 15000);
    return () => clearInterval(intervalRef.current);
  }, [dateKey]);

  const groups   = session?.groups || [];
  const total    = groups.reduce((s, g) => s + g.members.length, 0);
  const allNames = groups.flatMap((g) => g.members.map((m) => m.name));
  const q        = search.trim().toLowerCase();
  const anyHit   = q && groups.some((g) => g.members.some((m) => m.name.toLowerCase().includes(q)));

  const px = isMobile ? "16px" : isTablet ? "32px" : "80px";

  const dateDisplay = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const searchResultText = () => {
    if (!q) return "Search your name to find your group";
    let found = null;
    groups.forEach((g) => g.members.forEach((m) => {
      if (m.name.toLowerCase().includes(q)) found = { name: m.name, group: g.id };
    }));
    if (found)
      return (
        <>
          <span style={{ color: "var(--green)", fontWeight: 600 }}>✓ {found.name}</span>{" "}
          is in <strong>Group {found.group}</strong>
        </>
      );
    return <>No student found matching "<strong>{q}</strong>"</>;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>

      {/* ── Responsive keyframes ── */}
      <style>{`
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .sc-search-input {
          width: 100%;
          max-width: 380px;
          padding: 12px 16px 12px 42px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          background: var(--card);
          color: var(--ink);
          outline: none;
          box-sizing: border-box;
        }
        @media (max-width: 639px) {
          .sc-search-input { max-width: 100%; }
        }
        .sc-groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(296px, 1fr));
          gap: 16px;
        }
        @media (max-width: 639px) {
          .sc-groups-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .sc-groups-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .sc-header-inner {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
        }
        @media (max-width: 639px) {
          .sc-header-inner { flex-direction: column; align-items: flex-start; gap: 24px; }
        }
        .sc-search-bar {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        @media (max-width: 639px) {
          .sc-search-bar { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
        .sc-nav-date {
          font-size: 0.78rem;
          color: var(--muted);
        }
        @media (max-width: 639px) {
          .sc-nav-date { display: none; }
        }
        .sc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `0 ${px}`, height: 60,
        background: "rgba(245,242,235,0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        gap: 12,
      }}>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.3rem", flexShrink: 0 }}>
          Study<span style={{ color: "var(--accent)" }}>Circle</span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#d4f0e0", color: "#1a7a42",
          fontSize: "0.7rem", fontWeight: 600,
          letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "5px 12px", borderRadius: 20, flexShrink: 0,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a7a42", animation: "blink 1.4s infinite", display: "inline-block" }} />
          Live Today
        </div>
        <div className="sc-nav-date">{dateDisplay}</div>
      </nav>

      {/* ── Ticker ── */}
      {allNames.length > 0 && (
        <div style={{ background: "var(--ink)", overflow: "hidden", padding: "10px 0", whiteSpace: "nowrap" }}>
          <span style={{ display: "inline-flex", gap: 40, animation: "marquee 30s linear infinite" }}>
            {[...allNames, ...allNames, ...allNames].map((n, i) => (
              <span key={i} style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--paper)" }}>
                {n} <span style={{ color: "var(--accent)" }}>✦</span>
              </span>
            ))}
          </span>
        </div>
      )}

      {/* ── Page header ── */}
      <div style={{
        padding: isMobile ? "36px 16px 28px" : isTablet ? "48px 32px 36px" : "60px 80px 44px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="sc-header-inner">
          <div>
            <h1 style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: isMobile ? "2.2rem" : "clamp(2.4rem,5vw,3.8rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 14,
            }}>
              Today's <em style={{ fontStyle: "italic", color: "var(--accent)" }}>groups</em><br />are ready.
            </h1>
            <p style={{
              fontSize: "0.93rem", color: "var(--muted)", lineHeight: 1.65,
              maxWidth: 460, fontWeight: 300,
            }}>
              Find your name, see your group, and open your assigned Google Meet.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
            {[{ label: "Groups", value: groups.length }, { label: "Present", value: total }].map(({ label, value }) => (
              <div key={label} style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 12, padding: isMobile ? "12px 16px" : "16px 22px",
                textAlign: "center", minWidth: isMobile ? 72 : 90,
              }}>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: isMobile ? "1.6rem" : "2rem", lineHeight: 1 }}>{value || "—"}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{
        padding: isMobile ? "16px" : isTablet ? "20px 32px" : "24px 80px",
        background: "var(--cream)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="sc-search-bar">
          <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
            <svg style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="sc-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type your name to find your group…"
            />
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{searchResultText()}</div>
        </div>
      </div>

      {/* ── Groups area ── */}
      <div style={{ padding: isMobile ? "24px 16px 60px" : isTablet ? "32px 32px 60px" : "44px 80px 80px" }}>
        {session === undefined ? (
          <div className="spinner-page" style={{ minHeight: 300 }}><div className="spinner" /></div>
        ) : !session ? (
          <div style={{ textAlign: "center", padding: isMobile ? "60px 16px" : "100px 24px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.8rem", marginBottom: 10 }}>Groups not released yet</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--muted)", maxWidth: 320, margin: "0 auto", lineHeight: 1.65 }}>
              Your admin hasn't published today's groups yet. This page refreshes automatically every 15 seconds.
            </p>
          </div>
        ) : (
          <div className="sc-groups-grid">
            {groups.map((group, gi) => {
              const hasHit   = q && group.members.some((m) => m.name.toLowerCase().includes(q));
              const isDimmed = q && anyHit && !hasHit;

              return (
                <div
                  key={group.id}
                  style={{
                    background: "var(--card)",
                    border: `1.5px solid ${hasHit ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    opacity: isDimmed ? 0.28 : 1,
                    boxShadow: hasHit ? "0 0 0 3px rgba(200,96,42,0.14)" : "none",
                    transition: "all 0.2s",
                    animationDelay: `${gi * 0.06}s`,
                  }}
                >
                  {/* Card head */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px 14px", borderBottom: "1px solid var(--border)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: "var(--ink)", color: "var(--paper)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 700,
                      }}>{group.id}</div>
                      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1rem" }}>Group {group.id}</div>
                    </div>
                    <span style={{
                      fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.07em",
                      textTransform: "uppercase", padding: "3px 9px", borderRadius: 20,
                      background: hasHit ? "#fde8d8" : "#eae6de",
                      color: hasHit ? "var(--accent)" : "#5a574f",
                    }}>
                      {hasHit ? "Your Group" : "Open"}
                    </span>
                  </div>

                  {/* Members */}
                  <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 7 }}>
                    {group.members.map((m) => {
                      const isYou         = q && m.name.toLowerCase().includes(q);
                      const isCoordinator = group.coordinatorId &&
                        m.studentId?.toString() === group.coordinatorId?.toString();

                      return (
                        <div key={m.studentId} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 11px", borderRadius: 9,
                          background: isYou ? "#fde8d8" : isCoordinator ? "#eef6ff" : "var(--paper)",
                          border: isCoordinator ? "1px solid #b8d8f8" : "1px solid transparent",
                        }}>
                          {/* Avatar with coordinator star badge */}
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: "50%",
                              background: m.color,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.7rem", fontWeight: 700, color: "white",
                            }}>
                              {initials(m.name)}
                            </div>
                            {isCoordinator && (
                              <div title="Coordinator" style={{
                                position: "absolute", bottom: -2, right: -2,
                                width: 14, height: 14, borderRadius: "50%",
                                background: "#2979d4", border: "1.5px solid var(--card)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.52rem", color: "white", lineHeight: 1,
                              }}>★</div>
                            )}
                          </div>

                          {/* Name + sub-label */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: "0.875rem", fontWeight: 500,
                              display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
                            }}>
                              {m.name}
                              {isCoordinator && (
                                <span style={{
                                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em",
                                  textTransform: "uppercase", padding: "1px 6px", borderRadius: 10,
                                  background: "#d0e8ff", color: "#1a5fa8",
                                }}>Coordinator</span>
                              )}
                            </div>
                            {(isYou || isCoordinator) && (
                              <div style={{
                                fontSize: "0.67rem", marginTop: 1,
                                color: isYou ? "var(--accent)" : "#2979d4",
                                fontWeight: 700,
                              }}>
                                {isYou ? "← That's you!" : "leads this group"}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)" }}>
                    <a
                      href={group.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 8, width: "100%", padding: 12,
                        background: hasHit ? "var(--accent)" : "var(--ink)",
                        color: "var(--paper)", borderRadius: 9,
                        fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem",
                        fontWeight: 500, textDecoration: "none",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 10l4.55-2.278A1 1 0 0121 8.65v6.7a1 1 0 01-1.45.93L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                      </svg>
                      {hasHit ? "Join Your Meet →" : "Open Meet Link"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{
        padding: isMobile ? "24px 16px" : isTablet ? "28px 32px" : "32px 80px",
        borderTop: "1px solid var(--border)",
      }}>
        <div className="sc-footer">
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1rem" }}>
            Study<span style={{ color: "var(--accent)" }}>Circle</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            Groups reshuffle every session · Auto-refreshes every 15s
          </div>
        </div>
      </footer>
    </div>
  );
}