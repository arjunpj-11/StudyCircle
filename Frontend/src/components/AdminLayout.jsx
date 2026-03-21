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

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{TITLES[pathname] || "Dashboard"}</div>
          <div className="topbar-date">{formatDateDisplay(todayKey())}</div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}