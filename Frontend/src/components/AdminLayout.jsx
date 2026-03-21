import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { formatDateDisplay, todayKey } from "../utils/helpers";

const TITLES = {
  "/admin/attendance": "Attendance",
  "/admin/groups":     "Today's Groups",
  "/admin/students":   "Students",
  "/admin/meetlinks":  "Meet Links",
  "/admin/records":    "Attendance Records",
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, sidebarOpen]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", maxWidth: "100vw", overflowX: "hidden" }}>
      <style>{`
        /* Remove the global margin-left that assumes sidebar is fixed */
        .main { margin-left: 0 !important; }

        @media (max-width: 900px) {
          /* Sidebar must be visible (global CSS hides it) */
          .sidebar {
            display: flex !important;
            width: 240px !important;
            height: 100vh !important;
            position: relative !important;
          }
          /* Main must fill exactly the viewport width */
          .main {
            width: 100vw !important;
            max-width: 100vw !important;
            min-width: 0 !important;
            flex: 1 1 0 !important;
            overflow-x: hidden !important;
          }
          /* Reduce padding so inner content never overflows */
          .content {
            padding: 20px 16px 60px !important;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
          }
          .topbar {
            padding: 0 16px !important;
          }
          /* Stat cards: 2 columns on mobile */
          .stats-row {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 99,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar wrapper — fixed on mobile, flex item on desktop */}
      <div style={{
        position: isMobile ? "fixed" : "relative",
        top: 0, left: 0, bottom: 0,
        width: "240px",
        minWidth: "240px",
        zIndex: isMobile ? 100 : "auto",
        transform: isMobile && !sidebarOpen ? "translateX(-240px)" : "translateX(0)",
        transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1)",
        flexShrink: 0,
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen((o) => !o)}
                aria-label="Toggle sidebar"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 5,
                  padding: "4px 6px", borderRadius: 6,
                  color: "var(--ink)", flexShrink: 0,
                }}
              >
                <span style={{ display: "block", width: 20, height: 2, background: "currentColor", borderRadius: 2, transition: "all 0.2s", transform: sidebarOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
                <span style={{ display: "block", width: 20, height: 2, background: "currentColor", borderRadius: 2, transition: "all 0.2s", opacity: sidebarOpen ? 0 : 1 }} />
                <span style={{ display: "block", width: 20, height: 2, background: "currentColor", borderRadius: 2, transition: "all 0.2s", transform: sidebarOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
              </button>
            )}
            <div className="topbar-title">{TITLES[pathname] || "Dashboard"}</div>
          </div>
          <div className="topbar-date">{formatDateDisplay(todayKey())}</div>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}