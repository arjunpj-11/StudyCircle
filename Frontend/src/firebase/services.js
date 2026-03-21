import {
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, onSnapshot, serverTimestamp,
  query, orderBy, writeBatch,
} from "firebase/firestore";
import { db } from "./config";

/* ─── STUDENTS ─────────────────────────────────── */
export const studentsRef = () => collection(db, "students");

export const subscribeStudents = (callback) =>
  onSnapshot(query(studentsRef(), orderBy("name")), (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

export const addStudent = (data) =>
  addDoc(studentsRef(), {
    ...data,
    status: "active",
    coordSessions: 0,
    totalSessions: 0,
    createdAt: serverTimestamp(),
  });

export const updateStudent = (id, data) =>
  updateDoc(doc(db, "students", id), data);

export const deleteStudent = (id) =>
  deleteDoc(doc(db, "students", id));

/* ─── ATTENDANCE ────────────────────────────────── */
// doc path: attendance/{YYYY-MM-DD}
export const attendanceRef = (dateKey) =>
  doc(db, "attendance", dateKey);

export const saveAttendance = (dateKey, records) =>
  setDoc(attendanceRef(dateKey), { records, savedAt: serverTimestamp() });

export const getAttendance = async (dateKey) => {
  const snap = await getDoc(attendanceRef(dateKey));
  return snap.exists() ? snap.data() : null;
};

export const subscribeAttendance = (dateKey, callback) =>
  onSnapshot(attendanceRef(dateKey), (snap) =>
    callback(snap.exists() ? snap.data() : null)
  );

export const getAllAttendance = async () => {
  const snap = await getDocs(collection(db, "attendance"));
  return Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));
};

/* ─── GROUPS ────────────────────────────────────── */
// doc path: sessions/{YYYY-MM-DD}
export const sessionRef = (dateKey) =>
  doc(db, "sessions", dateKey);

export const saveSession = (dateKey, groups, published = false) =>
  setDoc(sessionRef(dateKey), { groups, published, updatedAt: serverTimestamp() });

export const publishSession = async (dateKey) =>
  updateDoc(sessionRef(dateKey), { published: true, publishedAt: serverTimestamp() });

export const subscribeSession = (dateKey, callback) =>
  onSnapshot(sessionRef(dateKey), (snap) =>
    callback(snap.exists() ? snap.data() : null)
  );

// Public listener (for student page)
export const subscribePublicSession = (dateKey, callback) =>
  onSnapshot(sessionRef(dateKey), (snap) => {
    const data = snap.exists() ? snap.data() : null;
    callback(data?.published ? data : null);
  });

/* ─── MEET LINKS ────────────────────────────────── */
export const meetLinksRef = () => collection(db, "meetLinks");

export const subscribeMeetLinks = (callback) =>
  onSnapshot(meetLinksRef(), (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

export const addMeetLink = (url) =>
  addDoc(meetLinksRef(), { url, used: false, createdAt: serverTimestamp() });

export const deleteMeetLink = (id) =>
  deleteDoc(doc(db, "meetLinks", id));

/* ─── BATCH: increment sessions after publish ───── */
export const incrementSessions = async (groups) => {
  const batch = writeBatch(db);
  groups.forEach(({ members, coordinatorId }) => {
    members.forEach((m) => {
      const ref = doc(db, "students", m.id);
      const isCoord = m.id === coordinatorId;
      batch.update(ref, {
        totalSessions: (m.totalSessions || 0) + 1,
        ...(isCoord ? { coordSessions: (m.coordSessions || 0) + 1 } : {}),
      });
    });
  });
  await batch.commit();
};