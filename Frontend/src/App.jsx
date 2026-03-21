import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }      from "./context/AuthContext";
import ProtectedRoute        from "./components/ProtectedRoute";
import AdminLayout           from "./components/AdminLayout";
import LoginPage             from "./pages/LoginPage";
import AttendancePage        from "./pages/AttendancePage";
import GroupsPage            from "./pages/GroupsPage";
import StudentsPage          from "./pages/StudentsPage";
import MeetLinksPage         from "./pages/MeetLinksPage";
import RecordsPage           from "./pages/RecordPages";
import StudentGroupsPage     from "./pages/StudentGroupsPage";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public student page */}
          <Route path="/groups" element={<StudentGroupsPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin (protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index                  element={<Navigate to="attendance" replace />} />
            <Route path="attendance"      element={<AttendancePage />} />
            <Route path="groups"          element={<GroupsPage />} />
            <Route path="students"        element={<StudentsPage />} />
            <Route path="meetlinks"       element={<MeetLinksPage />} />
            <Route path="records"         element={<RecordsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/attendance" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}