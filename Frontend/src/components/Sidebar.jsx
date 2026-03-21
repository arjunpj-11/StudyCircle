import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  {
    section: "Overview",
    items: [
      {
        to: "/admin/attendance", label: "Attendance",
        icon: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
      },
      {
        to: "/admin/groups", label: "Today's Groups",
        icon: <><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><circle cx="18" cy="9" r="3"/><path d="M21 21v-1a3 3 0 00-3-3"/></>,
      },
    ],
  },
  {
    section: "Manage",
    items: [
      {
        to: "/admin/students", label: "Students",
        icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
      },
      {
        to: "/admin/meetlinks", label: "Meet Links",
        icon: <path d="M15 10l4.55-2.278A1 1 0 0121 8.65v6.7a1 1 0 01-1.45.93L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>,
      },
      {
        to: "/admin/records", label: "Attendance Records",
        icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
      },
    ],
  },
];

export default function Sidebar({ onClose, isMobile }) {
  const { user, logout } = useAuth();
  const emailInitials = (user?.email || "AD").slice(0, 2).toUpperCase();
  const emailName     = (user?.email || "").split("@")[0];

  return (
    <aside className="sidebar" style={{
      // On mobile, render at natural height (full viewport via fixed positioning in parent)
      height: isMobile ? "100vh" : undefined,
    }}>
      {/* Logo row — with close button on mobile */}
      <div className="sidebar-logo" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          Study<span>Circle</span>
          <div className="sidebar-logo-sub">Admin Panel</div>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.5)", fontSize: "1.4rem",
              lineHeight: 1, padding: "2px 0", marginTop: 2,
            }}
          >
            ✕
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {items.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {icon}
                </svg>
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="admin-chip">
          <div className="admin-av">{emailInitials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="admin-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emailName}</div>
            <div className="admin-role">Admin</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "1.1rem", lineHeight: 1, flexShrink: 0 }}
          >⏻</button>
        </div>
      </div>
    </aside>
  );
}