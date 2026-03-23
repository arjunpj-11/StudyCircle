📢 Communication Session Group Manager

A web application built to improve communication sessions by ensuring every participant gets meaningful speaking time.



🚀 Problem Statement

In traditional communication sessions:

Each session lasts ~1 hour
Every participant gets only 2–3 minutes to speak
Most students don’t get enough time to improve their communication skills
💡 Solution

This application restructures sessions by:

Automatically dividing participants into small groups of 3
Assigning each group a dedicated Google Meet link
Ensuring each participant gets ~15 minutes of speaking time


🧠 How It Works

👨‍🏫 Admin Side
Add students
Mark attendance
Generate random groups (3 members per group)
Assign Google Meet links
Publish groups to users

👨‍🎓 User Side
No login required
View assigned group
Access Google Meet link directly


🛠️ Tech Stack

Frontend
React (Vite)

Backend
Node.js
Express.js

Database
MongoDB

📁 Project Structure
project-root/
│
├── Frontend/        # React frontend
├── Backend/        # Node.js backend
├── README.md


⚙️ Installation & Setup

1. Clone the repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

2. Setup Backend
cd server
npm install
npm run dev

3. Setup Frontend
cd client
npm install
npm run dev
🌐 Environment Variables

Create a .env file in the server folder:

MONGO_URI=your_mongodb_connection_string
PORT=5000
✨ Features
🎯 Random group generation
📊 Attendance tracking
🔗 Google Meet integration
⚡ Fast and simple UI
🔓 No authentication required for users
📸 Screenshots (Optional)

Add screenshots here if you have them

🔮 Future Improvements
Add authentication (Admin/User roles)
Real-time updates using WebSockets
Email/WhatsApp notifications for group links
Session history tracking
🤝 Contributing

Feel free to fork this repo and improve it!

📜 License

This project is open-source and available under the MIT License.

🙌 Acknowledgment

Built to improve real-world communication sessions and ensure equal participation for everyone.
