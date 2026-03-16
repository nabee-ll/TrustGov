# 🇮🇳 Passport Seva – Full Stack Application

A complete clone of the Indian Passport Seva portal built with **React** (frontend) and **Node.js / Express** (backend).

---

## 📁 Project Structure

```
passport-seva/
├── frontend/          ← React app (Create React App)
│   ├── public/
│   └── src/
│       ├── api/           ← Axios API client
│       ├── components/    ← Header, Footer, UI, AuthModals
│       ├── context/       ← AuthContext (JWT session)
│       └── pages/         ← Home, ApplyForm, Track, Dashboard, Appointment, etc.
│
├── backend/           ← Node.js / Express REST API
│   ├── data/          ← In-memory data store
│   ├── middleware/    ← JWT auth middleware
│   ├── routes/        ← auth, applications, appointments, offices, track, grievances
│   └── server.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ installed
- npm v9+

---

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev        # uses nodemon for hot reload
# OR
npm start          # production
```

Backend runs on: **http://localhost:5000**

API endpoints:
- `GET  /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `GET  /api/auth/me`
- `GET  /api/applications`
- `POST /api/applications`
- `POST /api/applications/:arn/pay`
- `GET  /api/applications/fees/calculate`
- `GET  /api/appointments`
- `GET  /api/appointments/slots`
- `POST /api/appointments`
- `DELETE /api/appointments/:id`
- `GET  /api/offices`
- `GET  /api/offices/states`
- `GET  /api/track`
- `POST /api/grievances`
- `GET  /api/grievances/track`

---

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

The `"proxy": "http://localhost:5000"` in `frontend/package.json` automatically forwards `/api` requests to the backend.

---

## 🔐 Demo Credentials

| Field    | Value                      |
|----------|----------------------------|
| Email    | `demo@passport.gov.in`     |
| Password | `Demo@1234`                |
| OTP      | `123456`                   |

---

## 📋 Features

### Frontend (React)
- **Multi-page SPA** with React Router v6
- **Authentication** — Login, Register, Aadhaar OTP (JWT-based)
- **Apply Online** — 4-step wizard for New/Re-issue/Tatkal/Minor/PCC/Emergency
- **Track Application** — Live status with timeline
- **Book Appointment** — Interactive calendar + time slot picker
- **Dashboard** — Applications, Appointments, Documents, Profile tabs
- **Passport Offices** — Searchable/filterable office directory
- **FAQ** — Searchable accordion
- **Document Advisor** — Service-specific document checklist
- **Fee Calculator** — Live fee breakdown with GST
- **Grievance Redressal** — Submit & track grievances
- **Photo Guidelines** — With SVG illustration
- **Contact Us** — Message form + office contacts

### Backend (Node.js / Express)
- RESTful API with Express
- JWT authentication (24h tokens)
- bcrypt password hashing
- In-memory data store (no DB required — swap for MongoDB/PostgreSQL easily)
- CORS configured for React frontend
- Full CRUD for applications, appointments, grievances

---

## 🔧 Customisation

### Swap in-memory store for a real database
Replace `backend/data/store.js` arrays with Mongoose models or Sequelize — the route logic stays the same.

### Environment variables
Create `backend/.env`:
```
PORT=5000
JWT_SECRET=your-secret-key-here
```

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router v6, Axios    |
| Backend   | Node.js, Express 4, JWT, bcryptjs   |
| Styling   | Custom CSS (no framework)           |
| Auth      | JSON Web Tokens (JWT)               |
| Storage   | In-memory (easily swappable)        |
