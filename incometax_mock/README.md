# 🏛️ Income Tax e-Filing Portal — Full Stack Clone

A fully functional clone of the official Income Tax Department e-Filing portal
built with **React.js** (frontend) and **Node.js / Express** (backend).

---

## 📁 Project Structure

```
incometax-portal/
├── backend/                  # Node.js + Express API
│   ├── server.js             # Entry point
│   ├── db.js                 # In-memory data store (demo)
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   └── routes/
│       ├── auth.js           # Login, Register, OTP
│       ├── tax.js            # File Return, Calculator, AIS
│       ├── user.js           # Profile management
│       └── refund.js         # Refund status
│
└── frontend/                 # React.js app
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js            # Routing & layout
        ├── App.css           # Global styles
        ├── index.js          # React entry
        ├── context/
        │   └── AuthContext.js # Auth state management
        ├── components/
        │   ├── Header.js     # Nav + login/logout
        │   └── Footer.js
        └── pages/
            ├── Home.js           # Landing page
            ├── Login.js          # Password + OTP login
            ├── Register.js       # New user registration
            ├── Dashboard.js      # Authenticated dashboard
            ├── FileReturn.js     # 5-step ITR filing wizard
            ├── TaxCalculator.js  # Tax calculator (New/Old regime)
            ├── RefundStatus.js   # Refund tracker
            ├── MyReturns.js      # Filed returns history
            └── Profile.js        # User profile management
```

---

## 🚀 Setup & Running

### Prerequisites
- Node.js v18+ and npm

### 1. Backend Setup

```bash
cd backend
npm install
npm start
# API runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

Both servers must run simultaneously. The React app proxies API calls to port 5000.

---

## 🔐 Demo Credentials

| Field    | Value        |
|----------|--------------|
| PAN      | ABCDE1234F   |
| Password | Test@1234    |

**OTP Login**: Enter PAN → click "Send OTP" → the OTP will appear on screen (dev mode).

---

## ✅ Features Implemented

### 🔑 Authentication
- Login with PAN + Password
- Login with PAN + OTP (mock SMS)
- JWT-based session management (8-hour token)
- User registration with PAN validation

### 📄 ITR Filing (5-Step Wizard)
- Select Assessment Year & ITR Form (ITR-1 to ITR-4)
- Choose New/Old Tax Regime
- Enter income details (Salary, House Property, Capital Gains, Other Sources)
- Enter deductions (80C, 80D, HRA) for Old Regime
- Tax computation with cess, rebate u/s 87A
- Review & Submit with acknowledgement number generation

### 🧮 Tax Calculator
- New Regime & Old Regime support
- Age-based slab selection (Below 60 / Senior / Super Senior)
- Deductions under 80C, 80D, HRA for old regime
- Effective tax rate calculation
- Full slab table reference

### 💰 Refund Status Tracker
- Public search by PAN + Assessment Year
- Visual timeline (5-step: Filed → Verified → Processing → Initiated → Credited)
- Status-aware UI feedback

### 📊 Dashboard
- Stats: total returns, latest AY, pending refund, TDS deducted
- Quick action grid
- AIS summary (Annual Information Statement)
- Profile summary card
- Recent returns table

### 👤 Profile Management
- View personal details (PAN, Name, DOB, Aadhaar)
- Edit contact details (Email, Mobile, Address)
- Account security section

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| POST   | /api/auth/login         | PAN + password login|
| POST   | /api/auth/register      | New registration    |
| POST   | /api/auth/send-otp      | Send OTP to mobile  |
| POST   | /api/auth/verify-otp    | Verify OTP & login  |

### Tax (Protected)
| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| GET    | /api/tax/returns        | Get all returns     |
| POST   | /api/tax/file-return    | File new ITR        |
| POST   | /api/tax/calculate      | Calculate tax       |
| GET    | /api/tax/ais            | Get AIS summary     |

### User (Protected)
| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| GET    | /api/user/profile       | Get profile         |
| PUT    | /api/user/profile       | Update profile      |

### Refund
| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| GET    | /api/refund/status      | Status (auth)       |
| POST   | /api/refund/check       | Public refund check |

---

## 🛠️ Tech Stack

| Layer     | Technology                           |
|-----------|--------------------------------------|
| Frontend  | React 18, React Router v6, Axios     |
| Backend   | Node.js, Express 4, JWT, bcryptjs    |
| State     | React Context API                    |
| Styling   | Pure CSS with CSS variables          |
| Auth      | JWT (Bearer tokens, 8h expiry)       |
| Storage   | In-memory (replace with MongoDB/PostgreSQL for production) |

---

## 🏗️ Production Upgrade Notes

To make this production-ready:

1. **Database**: Replace `db.js` in-memory store with MongoDB/PostgreSQL
2. **Environment Variables**: Add `.env` for `JWT_SECRET`, `DB_URI`, `PORT`
3. **SMS/Email**: Integrate Twilio or AWS SNS for real OTP delivery
4. **HTTPS**: Add SSL certificate
5. **Rate Limiting**: Add `express-rate-limit` on auth routes
6. **Validation**: Add `express-validator` on all input routes
7. **Logging**: Add Winston or Morgan for request logging

---

*This is an educational demo clone. Not affiliated with the Government of India.*
