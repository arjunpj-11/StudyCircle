// Switch between local dev and production
const BASE = import.meta.env.VITE_API_URL || "";

const getToken = () => localStorage.getItem("sc_token");

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const request = async (url, options = {}) => {
  let res;
  try {
    res = await fetch(`${BASE}${url}`, { ...options, headers: headers() });
  } catch {
    throw new Error("Cannot reach server. Is the backend running?");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned an invalid response.");
  }

  if (!res.ok) throw new Error(data?.message || "Request failed.");
  return data;
};

/* ── STUDENTS ── */
export const apiGetStudents       = ()           => request("/api/students");
export const apiAddStudent        = (data)       => request("/api/students", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateStudent     = (id, data)   => request(`/api/students/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const apiDeleteStudent     = (id)         => request(`/api/students/${id}`, { method: "DELETE" });
export const apiIncrementSessions = (groups)     => request("/api/students/increment-sessions", { method: "POST", body: JSON.stringify({ groups }) });

/* ── ATTENDANCE ── */
export const apiGetAttendance     = (dateKey)          => request(`/api/attendance/${dateKey}`);
export const apiGetAllAttendance  = ()                 => request("/api/attendance");
export const apiSaveAttendance    = (dateKey, records) => request(`/api/attendance/${dateKey}`, { method: "PUT", body: JSON.stringify({ records }) });

/* ── SESSIONS ── */
export const apiGetSession        = (dateKey)                    => request(`/api/sessions/${dateKey}`);
export const apiGetPublicSession  = (dateKey)                    => request(`/api/sessions/${dateKey}/public`);
export const apiSaveSession       = (dateKey, groups, published = false) => request(`/api/sessions/${dateKey}`, { method: "PUT", body: JSON.stringify({ groups, published }) });
export const apiPublishSession    = (dateKey)                    => request(`/api/sessions/${dateKey}/publish`, { method: "PATCH" });

/* ── MEET LINKS ── */
export const apiGetMeetLinks      = ()    => request("/api/meetlinks");
export const apiAddMeetLink       = (url) => request("/api/meetlinks", { method: "POST", body: JSON.stringify({ url }) });
export const apiDeleteMeetLink    = (id)  => request(`/api/meetlinks/${id}`, { method: "DELETE" });