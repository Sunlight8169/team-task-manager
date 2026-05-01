# 🚀 TaskFlow — Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control, built with Flask and React.

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Team%20Task%20Manager-6366f1?style=for-the-badge)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql)

---

## 📌 About The Project

**TaskFlow** is a collaborative team task management application where multiple users can sign up, create projects, manage team members, assign tasks, and track progress — all in one place.

Built as a full-stack project using:
- **Backend** — Flask REST API with JWT Authentication
- **Database** — MySQL for structured data
- **Frontend** — React (Vite) with Dark/Light Mode

---

## ✨ Features

- 🔐 **Authentication** — Secure Signup, Login, Logout using JWT tokens
- 🔑 **Forgot Password** — Reset password using registered email
- 📊 **Dashboard** — View total tasks, status breakdown, overdue tasks and progress bars
- 👤 **User Profile** — Welcome banner with name, email and User ID
- 📁 **Projects** — Create projects, view all projects, manage team members
- 👥 **Add Members** — Add team members to projects using their User ID
- 📝 **Tasks** — Create tasks with title, description, due date, priority and assignee
- 🔄 **Status Tracking** — Update task status: To Do → In Progress → Done
- 🔥 **Overdue Detection** — Automatically highlights overdue tasks
- 🌙 **Dark / Light Mode** — Toggle between themes, preference saved locally
- 🛡️ **Role Based Access** — Admin (Project Creator) and Member roles

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router DOM |
| Backend | Python, Flask, Flask-CORS |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) |
| HTTP Client | Axios |
| Deployment | Railway |

---

## 📁 Project Structure

```
team-task-manager-fullstack/
│
├── backend/
│   ├── app.py          # Flask REST API — all routes
│   ├── config.py       # Database connection (not pushed to GitHub)
│   ├── requirements.txt
│   └── .gitignore
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Axios instance with JWT interceptor
    │   ├── components/
    │   │   └── Navbar.jsx        # Shared navbar with dark/light toggle
    │   ├── context/
    │   │   └── AuthContext.jsx   # JWT auth state management
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   ├── ProjectDetail.jsx
    │   │   ├── Tasks.jsx
    │   │   └── CreateTask.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── .gitignore
```

---

## 🗄️ Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);

-- Projects Table
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Project Members Table
CREATE TABLE project_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  user_id INT,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tasks Table
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  due_date DATE,
  priority ENUM('Low', 'Medium', 'High'),
  status ENUM('To Do', 'In Progress', 'Done'),
  project_id INT,
  assigned_to INT,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

---

## 🔌 API Endpoints

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login and get JWT token |
| POST | `/check-email` | Verify email exists |
| POST | `/reset-password` | Reset user password |
| GET | `/me` | Get current user info |

### Project Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-project` | Create new project |
| GET | `/projects` | Get all user projects |
| POST | `/add-member` | Add member by User ID |
| GET | `/project-members/<id>` | Get project members |

### Task Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-task` | Create new task |
| GET | `/tasks` | Get all assigned tasks |
| PUT | `/update-task/<id>` | Update task status |
| GET | `/dashboard` | Get dashboard stats |

---

## ⚙️ Local Setup

### Backend Setup

```bash
# Go to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install flask flask-cors flask-mysqldb PyJWT mysql-connector-python

# Create config.py file
```

Create `backend/config.py`:
```python
import mysql.connector

def get_db_connection():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="YOUR_PASSWORD",
        database="taskmanager"
    )
    return conn
```

```bash
# Run Flask server
python app.py
```

### Frontend Setup

```bash
# Go to frontend folder
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs on: `http://localhost:5173`
Backend runs on: `http://localhost:5000`

---

## 🔐 How Authentication Works

```
User Signup/Login
      ↓
Backend generates JWT Token (expires in 2 hours)
      ↓
Token stored in localStorage
      ↓
Every API request sends token in Authorization header
      ↓
Backend verifies token → allows/rejects request
```

---

## 👥 How to Add Team Members

```
1. Member signs up → gets their User ID on Dashboard
2. Admin opens Project → Project Details
3. Admin enters Member's User ID → Add Member
4. Member is now part of the project
5. Tasks can be assigned to them
```

---

## 🌙 Dark / Light Mode

- Toggle button in Navbar
- Theme preference saved in localStorage
- Persists across page refreshes

---

## 🚀 Deployment

- Backend deployed on **Railway**
- Frontend deployed on **Railway / Vercel**
- Database hosted on **Railway MySQL**

---

## 👨‍💻 Developer

**Suraj Vishwakarma**
- GitHub: [@Sunlight8169](https://github.com/Sunlight8169)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Built with ❤️ using Flask + React
