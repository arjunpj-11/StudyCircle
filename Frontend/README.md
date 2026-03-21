# StudyCircle — React + Firebase

A study group management dashboard with attendance tracking, group generation, and student-facing group view.

---

## Project Structure

```
src/
├── firebase/
│   ├── config.js          ← 🔧 Put your Firebase config here
│   └── services.js        ← All Firestore read/write operations
├── context/
│   └── AuthContext.jsx    ← Firebase Auth (email/password)
├── hooks/
│   └── useToast.js        ← Toast notifications
├── utils/
│   └── helpers.js         ← Date utils, shuffle, group generation
├── components/
│   ├── Sidebar.jsx        ← Admin sidebar nav
│   ├── AdminLayout.jsx    ← Admin shell (sidebar + topbar + outlet)
│   └── ProtectedRoute.jsx ← Redirects unauthenticated users to /login
├── pages/
│   ├── LoginPage.jsx          ← Admin login
│   ├── AttendancePage.jsx     ← Mark attendance + generate groups
│   ├── GroupsPage.jsx         ← View/publish/reshuffle groups
│   ├── StudentsPage.jsx       ← Add/remove/freeze students
│   ├── MeetLinksPage.jsx      ← Manage Meet link pool
│   ├── RecordsPage.jsx        ← Attendance history, Excel/PDF export
│   └── StudentGroupsPage.jsx  ← Public page students visit
├── App.jsx                ← Routes
├── main.jsx               ← Entry point
└── index.css              ← All styles
```

---

## Setup Steps

### 1. Create the Vite project

```bash
npm create vite@latest studycircle -- --template react
cd studycircle
```

### 2. Drop in these files

Copy everything from this folder into your project, replacing the generated files:
- Replace `src/` entirely with the `src/` here
- Replace `index.html`, `vite.config.js`, `package.json`
- Add `firestore.rules` to the project root

### 3. Install dependencies

```bash
npm install
```

### 4. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database** (start in test mode, then apply the rules below)
4. Enable **Authentication** → Sign-in method → **Email/Password**
5. Go to **Project Settings → Your Apps → Web** → copy the config object

### 5. Add your Firebase config

Open `src/firebase/config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123...",
};
```

### 6. Create your admin user

In Firebase Console → Authentication → Users → Add User:
- Email: `admin@yourdomain.com`
- Password: (anything secure)

Or run this once in the browser console after the app loads:
```js
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./src/firebase/config";
createUserWithEmailAndPassword(auth, "admin@email.com", "yourpassword");
```

### 7. Apply Firestore security rules

In Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`.

### 8. Run the app

```bash
npm run dev
```

---

## Routes

| URL                     | Who sees it         | Description                        |
|-------------------------|---------------------|------------------------------------|
| `/login`                | Admin               | Email/password login               |
| `/admin/attendance`     | Admin (auth)        | Mark attendance, generate groups   |
| `/admin/groups`         | Admin (auth)        | View, reshuffle, publish groups    |
| `/admin/students`       | Admin (auth)        | Add/remove/freeze students         |
| `/admin/meetlinks`      | Admin (auth)        | Manage Meet link pool              |
| `/admin/records`        | Admin (auth)        | Attendance history, Excel/PDF      |
| `/groups`               | **Public**          | Students find their group + Meet   |

---

## Firestore Collections

| Collection    | Doc ID         | Description                             |
|---------------|----------------|-----------------------------------------|
| `students`    | auto-id        | Student records (name, roll, status…)  |
| `attendance`  | `YYYY-MM-DD`   | Daily attendance `{ records: {id: P/A/F} }` |
| `sessions`    | `YYYY-MM-DD`   | Groups for the day + published flag     |
| `meetLinks`   | auto-id        | Pool of Google Meet URLs               |

---

## How the flow works

1. **Admin** goes to `/admin/attendance` and marks students present/absent
2. Clicks **Save** to persist to Firestore
3. Clicks **Shuffle & Generate Groups** → groups saved to `sessions/{today}`
4. Goes to `/admin/groups`, reviews, optionally reshuffles
5. Clicks **Publish to Students** → `published: true` written to Firestore
6. **Students** open `/groups` in their browser — page shows live groups via real-time listener
7. Students search their name, find their group, click "Join Your Meet"

---

## Export formats

- **Excel (.xlsx)** — Two sheets: full student×date attendance grid + daily summary
- **PDF** — Auto-landscape for wide date ranges, colour-coded P/A cells, daily summary page, page numbers

---

## Build & Deploy

```bash
npm run build        # outputs to dist/
npm run preview      # preview the build locally
```

For Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # set dist/ as public, configure as SPA
firebase deploy
```