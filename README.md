![StudyCircle Preview](./previewimage.jpeg)

# 📢 Communication Session Group Manager

A web application that restructures communication sessions to ensure every participant gets meaningful speaking time — not just 2–3 minutes.

---

## 🚩 The Problem

In traditional communication sessions:

- Each session lasts ~1 hour
- Every participant gets only **2–3 minutes** to speak
- Most students don't get enough practice to actually improve

---

## 💡 The Solution

This app restructures sessions by:

- ✅ Dividing participants into **small groups of 3**
- ✅ Assigning each group a **dedicated Google Meet link**
- ✅ Giving each participant **~15 minutes** of speaking time

---

## 🧠 How It Works

### 👨‍🏫 Admin
1. Add students
2. Mark attendance
3. Generate random groups (3 members each)
4. Assign Google Meet links
5. Publish groups for users to view

### 👨‍🎓 User
1. Open the app — no login required
2. View assigned group
3. Click the Google Meet link and join

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Backend | Node.js, Express.js |
| Database | MongoDB |

---

## 📁 Project Structure

```
project-root/
├── Frontend/    # React (Vite) frontend
├── Backend/     # Node.js + Express backend
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/arjunpj-11/StudyCircle
cd StudyCircle
```

### 2. Setup backend
```bash
cd Backend
npm install
npm run dev
```

### 3. Setup frontend
```bash
cd Frontend
npm install
npm run dev
```

### 4. Configure environment variables

Create a `.env` file in the `Backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

---

## ✨ Features

- 🎯 Random group generation (3 per group)
- 📊 Attendance tracking
- 🔗 Google Meet link integration
- ⚡ Fast and minimal UI
- 🔓 No login required for users

---

## 🔮 Future Improvements

- [ ] Admin & user authentication
- [ ] Real-time updates via WebSockets
- [ ] Email / WhatsApp notifications for group links
- [ ] Session history tracking

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork and improve this project.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).

---

> 💬 Built to solve a real problem — ensuring equal speaking time and better communication practice for everyone in a session.
