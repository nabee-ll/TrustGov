# Parivahan Portal Clone

A full-stack educational clone of the Indian Government's Parivahan Sewa portal (https://parivahan.gov.in/).

## Tech Stack

**Frontend:** React + Vite, Tailwind CSS, React Router, Axios  
**Backend:** Node.js, Express.js, MongoDB Atlas + Mongoose, JWT Auth

---

## Project Structure

```
parivahan-clone/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── serviceController.js
│   │   └── applicationController.js
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   └── applications.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   └── ServiceCard.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── DrivingLicense.jsx
    │   │   ├── VehicleRegistration.jsx
    │   │   └── ApplicationStatus.jsx
    │   ├── services/api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## Setup & Run

### 1. MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Create a database user and whitelist your IP
3. Copy your connection string

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Edit .env file
# Replace MONGODB_URI with your actual MongoDB Atlas connection string
nano .env
# or
notepad .env

# Start the server
node server.js
# or for development with auto-reload:
npm run dev
```

The backend will start on **http://localhost:5000**  
On first run it automatically seeds 12 sample services into MongoDB.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will start on **http://localhost:5173**

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user (protected) |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/services | Get all services |
| GET | /api/services?category=Driving+Licence | Filter by category |
| GET | /api/services/:id | Get service by ID |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/applications/apply | Submit application (protected) |
| GET  | /api/applications/user | Get user's applications (protected) |
| GET  | /api/applications/status/:appNumber | Track by app number |

---

## Environment Variables (backend/.env)

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/parivahan?retryWrites=true&w=majority
JWT_SECRET=parivahan_jwt_secret_key_2024
PORT=5000
```

---

## Features

- ✅ Government-style UI with tricolor accents and authentic header
- ✅ User registration & login with JWT authentication
- ✅ 12 pre-seeded transport services across 4 categories
- ✅ Multi-step application forms (Driving Licence & Vehicle Registration)
- ✅ Application status tracking with timeline visualization
- ✅ Personal dashboard showing all submitted applications
- ✅ Protected routes requiring authentication
- ✅ Form validation (client-side)
- ✅ Loading states and error handling
- ✅ Fully responsive design (mobile + desktop)
- ✅ Auto-generated application numbers (PRVxxxxxxxx)

---

## Pages

| Page | URL | Auth Required |
|------|-----|---------------|
| Home | / | No |
| Login/Register | /login | No |
| Dashboard | /dashboard | Yes |
| Driving Licence | /driving-license | Yes |
| Vehicle Registration | /vehicle-registration | Yes |
| Application Status | /application-status | No |

---

*This project is for educational purposes only and is not affiliated with the Government of India.*
