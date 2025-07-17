# 🧩 Real-Time Collaborative To-Do Board

A full-stack collaborative Kanban-style to-do board that supports multiple users, live task updates, conflict resolution, smart task assignment, and an activity log — similar to a mini Trello board.

---

## 🔧 Tech Stack

- **Frontend**: React.js (no UI libraries, custom CSS only)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT-based login & registration + bcrypt   
- **Real-Time Communication**: Socket.IO for real-time updates  
- **Styling**: Pure CSS (mobile-responsive, animation included)

---

## ⚙️ Setup & Installation Instructions

### 🔁 Prerequisites

- Node.js & npm
- MongoDB (local or Atlas URI)
- Git

### 📦 1. Clone the Repository

```bash
git clone https://github.com/Suvojeet-Haldar/collab-todo-app.git
cd collab-todo-app
```

### 🔧 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

### ✍️ Edit .env with your credentials:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
PORT=5000
CLIENT_URL=http://localhost:3000

### Then run the backend:

```bash
npm start
```

### 🎨 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```
The frontend will be available at http://localhost:3000
The backend runs on http://localhost:5000

---

## 🚀 Feature List & Usage Guide

### 🧑‍💻✅ User Registration & Login
- Secure sign-up & login
- JWT-based authentication
- Passwords hashed with bcrypt

### 🧠 Smart Assign
- Automatically assigns task to user with **fewest active tasks**
- Balances team workload dynamically

### ⚠️ Conflict Detection & Resolution
- Detect simultaneous edits  to the same task
- Triggers Conflict Modal with:
    - Your version vs Server version
    - Let users choose: Merge or Overwrite

### ✅ Task Management
- Create, edit, delete tasks
- Drag & drop across columns
- Assign/unassign users
- Prioritize tasks (Low, Medium, High)
- Task title validation (must be unique & not match column names)

### 📦 Kanban Board
- Columns: Todo, In Progress, Done
- Drag & drop support
- Live updates across users

### 🔁 Real-Time Sync
- Instant updates across all users
- Drag-drop and edits sync live

### 📜 Activity Log
- Real-time log of last 20 actions
- Logged with user, action type, and timestamp
- Updates in real-time

### 📱 Mobile Responsiveness
- Fully responsive layout
- Touch-friendly UI (min 40px tap targets)
- Adjusted font sizes, spacing & alignment

### ✨ Custom UI + Animations
- Pure CSS — no frameworks like Bootstrap or Material UI
- Smooth fade-in task card animation
- Animated drag/drop transitions

---

## 🧠 Smart Assign Logic (Explained)

### When the "Smart Assign" button is clicked:

- The backend fetches all users.
- Counts active tasks (not in "Done") for each.
- Finds the user with the fewest active tasks.
- Assigns the task to that user.
- Sends real-time update via Socket.IO.

### If two or more users are tied, the first match is selected.

---

## 🛡️ Conflict Handling Logic (Explained)

- Every task tracks lastEdited and updatedBy.
- When User A opens a task for edit, it captures the last edit timestamp.
- If User B updates the same task and saves before User A, the timestamp on the server changes.
- When User A tries to save, a conflict is detected (timestamps mismatch).
- A modal appears for A to:
    - See their version vs server version
    - Choose to merge or overwrite
- Resolved version is synced across users via Socket.IO.

---

## 🌐 Deployed live app & Demo video Links

| Description     | Link                                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------                                                                                         |
| 🔗 Frontend URL | [https://collab-todo-app-one.vercel.app](https://collab-todo-app-one.vercel.app)                                                                                         |
| 🔗 Backend URL  | [https://collab-todo-app.onrender.com](https://collab-todo-app.onrender.com)                                                                                             |
| 🎥 Demo Video   | [https://drive.google.com/file/d/1UbngggcIKJ6iYlRsNZPpw4C4DGv05nzk/view?usp=sharing](https://drive.google.com/file/d/1UbngggcIKJ6iYlRsNZPpw4C4DGv05nzk/view?usp=sharing) |

---
