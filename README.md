<div align="center">

# 💊 MediScout

### AI-Powered Smart Pharmacy Platform

*From prescription image to doorstep — in real time.*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

</div>

---

## 🚀 What is MediScout?

MediScout is a **full-stack healthcare platform** that digitizes the pharmacy workflow end-to-end. A patient uploads a photo of their handwritten prescription → **Google Gemini AI** reads and extracts every drug → the system checks live inventory → a pharmacist reviews and approves → the patient pays via **Stripe** → a delivery rep tracks and completes the order.

**Every step is connected in real time via Socket.IO** — no page refreshes, no manual status checks.

---

## ✨ Highlights That Make This Project Stand Out

### 🤖 1. AI-Powered Prescription Processing (Google Gemini Vision)

The core feature. Instead of typing drug names manually, the patient simply **uploads an image** of their prescription (camera or file). The backend sends it to **Google Gemini Vision** with a carefully engineered prompt that:

- Extracts every drug name, active ingredient, dosage, and quantity from the image
- Returns a structured JSON array — not a raw text blob
- Handles messy, handwritten, Arabic prescriptions

```
Prescription Photo → Gemini AI → Structured Drug List → Inventory Check → Result
```

> This isn't just an API call — the prompt is engineered to gracefully handle edge cases, normalize drug names, and return a consistent schema the backend validates before saving.

---

### ⚡ 2. Real-Time Multi-Role Notification System (Socket.IO)

The platform has **4 distinct user roles**, and all of them communicate through a live event-driven architecture:

| Event | From | To |
|---|---|---|
| `prescription:new` | Patient submits prescription | Pharmacist's dashboard updates instantly |
| `prescription:status_updated` | Pharmacist approves/rejects | Patient sees result in real time |
| `delivery:new_order` | Patient completes checkout | Delivery rep gets new order immediately |

Socket.IO rooms are **role-aware and user-aware** — a pharmacist only sees their own assigned prescriptions, and a delivery rep only receives orders assigned to them. No polling, no page reload required.

---

### 🔄 3. Smart Drug Availability & Alternative System

When a drug in the prescription is **out of stock**, MediScout doesn't just say "unavailable" — it finds an alternative:

1. **Available** → drug found in stock, price fetched, added to cart
2. **Alternative Available** → original not found, system queries by `activeIngredient` and suggests the closest match
3. **Out of Stock** → no alternatives exist, clearly marked

The pharmacist can then **create and attach a custom alternative** from the dashboard. After the pharmacist's full review is complete, **the patient decides** whether to accept or reject each alternative — giving control to the right person at the right time.

---

### 🧑‍💼 4. Role-Based Access Control (RBAC) with 4 Roles

The system enforces strict role-based routing on both frontend and backend:

```
patient    → uploads prescriptions, reviews results, checks out, tracks orders
pharmacist → reviews prescriptions, manages alternatives, manages inventory
delivery   → sees new orders, manually updates delivery status
admin      → manages all users, roles, and system health
```

Frontend `ProtectedRoute` guards routes by role. Backend `authorize()` middleware protects every API endpoint. A delivery rep literally **cannot hit** a pharmacist endpoint — the middleware blocks it at the server level.

---

### 💳 5. Stripe Payment Integration with Smart Cart Logic

Before a patient can reach the Stripe checkout, the system enforces **purchase eligibility**:

- At least one approved drug must exist in the prescription
- If a pharmacist suggested an alternative and the patient rejected it — it's excluded from the cart
- Out-of-stock items that have no alternatives are excluded automatically

Only items the patient **can actually receive** are sent to Stripe. The cart reflects reality.

---

### 🏗️ 6. Clean Architecture: Redux Toolkit × TanStack Query Hybrid

Rather than choosing one state management approach, MediScout uses **both — intentionally**:

| Layer | Tool | Why |
|---|---|---|
| Global state (auth, prescriptions, Socket events) | Redux Toolkit | Persistent, cross-component, event-driven |
| Server state (inventory CRUD, caching) | TanStack Query | Cache invalidation, background refetch, loading states |

Each feature owns its logic. Components don't drill props — they consume hooks directly. `PrescriptionReviewModal` handles its own approval mutation. `DrugTable` manages its own delete flow. **No parent orchestration required.**

---

### 📦 7. Production-Ready Architecture

```
mediscout/
├── mediscout-backend/
│   ├── controllers/      # Business logic per domain
│   ├── middleware/        # auth (protect, authorize), error handling
│   ├── models/            # Mongoose schemas with full type safety
│   ├── routes/            # Express routers grouped by resource
│   ├── config/            # DB connection
│   └── socket.js          # Socket.IO rooms & event emitters
│
└── mediscout-frontend/
    ├── src/
    │   ├── features/      # Domain-driven: auth | prescriptions | pharmacist | inventory | delivery | admin
    │   ├── routes/        # Centralized lazy-loaded route config
    │   ├── store/         # Redux slices (auth, prescription)
    │   ├── services/      # apiClient (Axios) + socketService
    │   └── components/    # Shared UI: layout, common, ui
```

> Routes are lazy-loaded with `React.lazy + Suspense`. Every page is a separate bundle — a delivery rep never downloads the admin bundle. A patient never downloads the pharmacist dashboard.

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express 5** — REST API
- **MongoDB** + **Mongoose** — Data modeling
- **Socket.IO** — Real-time bidirectional events
- **Google Gemini Vision** (`@google/genai`) — AI prescription reading
- **Stripe** — Secure payment processing
- **JWT** + **bcryptjs** — Authentication & password hashing
- **express-async-handler** — Clean async error propagation

### Frontend
- **React 19** + **TypeScript** — UI framework with full type safety
- **Redux Toolkit** — Global state management
- **TanStack Query v5** — Server state, caching, background sync
- **React Router v7** — Lazy-loaded, role-protected routing
- **React Hook Form** + **Zod** — Form validation
- **Tailwind CSS v4** — Utility-first styling
- **Lucide React** — Icon system
- **Axios** — HTTP client with interceptors
- **Socket.IO Client** — Real-time connection management

---

## 🔄 The Full Prescription Journey

```
[Patient]
   │
   ├─ Uploads prescription image + contact info
   │
   ▼
[AI Processing — Google Gemini]
   │
   ├─ Extracts drug names, dosages, quantities
   ├─ Checks each drug against live inventory
   ├─ Flags alternatives for out-of-stock items
   │
   ▼
[Pharmacist Dashboard] ← Socket.IO notification fires instantly
   │
   ├─ Reviews each item
   ├─ Can approve, reject, or add custom alternatives
   │
   ▼
[Patient] ← Socket.IO notification fires with approval result
   │
   ├─ Sees pharmacist's decision in real time
   ├─ Accepts or rejects suggested alternatives
   ├─ Proceeds to Stripe checkout (only eligible items)
   │
   ▼
[Delivery Dashboard] ← Socket.IO notification fires on new order
   │
   ├─ Sees order details and patient address
   ├─ Manually transitions: PENDING → PROCESSING → COMPLETED
   │
   ▼
[Patient] ← Real-time status updates throughout
   └─ Receives medication 🎉
```

---

## ⚙️ Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google AI Studio API Key
- Stripe Test API Keys

### Backend
```bash
cd mediscout-backend
npm install

# Create .env file
cp .env.example .env
# Fill in: MONGO_URI, JWT_SECRET, GEMINI_API_KEY, STRIPE_SECRET_KEY, FRONTEND_URL

npm run dev
# Server starts on http://localhost:5000
```

### Frontend
```bash
cd mediscout-frontend
npm install

# Create .env file
cp .env.example .env
# Fill in: VITE_API_URL, VITE_SOCKET_URL, VITE_STRIPE_PUBLISHABLE_KEY

npm run dev
# App starts on http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend (`.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
GEMINI_API_KEY=your_google_ai_key
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🚀 Deployment

| Service | Platform | Notes |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Auto-detects Vite, free tier |
| **Backend** | [Render](https://render.com) | Supports WebSockets (Socket.IO), free tier |
| **Database** | [MongoDB Atlas](https://cloud.mongodb.com) | Free 512MB cluster |

> Vercel's Serverless Functions do not support persistent WebSocket connections. Render is used for the backend specifically because Socket.IO requires a persistent server process.

---

## 📄 License

MIT — feel free to use, modify, and distribute.

---

<div align="center">

Built with focus on **real-world architecture**, **clean code**, and **AI integration**.

</div>
