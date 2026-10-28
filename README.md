# SMART PLANT AI
**AI-Based Smart Plant Disease Detection System**

An end-to-end mobile-first Progressive Web App (PWA) with a dedicated Node.js/TypeScript backend connected to the real Pl@ntNet AI Identification API and Firebase Firestore.

---

## Project Structure

```
plant D/
├── frontend/                # Frontend PWA (React 19, TanStack Router, Vite, Tailwind CSS)
│   ├── src/
│   │   ├── routes/          # File-based routes (Home, Scanner, Result, History, About)
│   │   ├── components/      # UI components (Camera preview, ConfidenceBar, Navigation)
│   │   └── lib/             # PWA registration and plant-analysis contract
│   └── .env                 # VITE_API_BASE_URL=http://localhost:5000
│
└── backend/                 # Backend AI & Database Service (Node.js, Express, TypeScript)
    ├── src/
    │   ├── controllers/     # Plant analysis upload controller
    │   ├── services/        # Real Pl@ntNet AI API client & Firebase Firestore bridge
    │   ├── types/           # Strongly typed schemas matching frontend
    │   └── server.ts        # Express server, CORS & Multer streaming
    └── .env                 # PLANTNET_API_KEY & Firebase credentials
```

---

## 3-Step Quick Start

### Step 1: Start Backend API
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`.*

### Step 2: Configure Pl@ntNet API Key
Get a free API key at [https://my.plantnet.org/](https://my.plantnet.org/) and add it to `backend/.env`:
```env
PLANTNET_API_KEY=your_key_here
```

### Step 3: Start Frontend PWA
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend opens at `http://localhost:8080`.*

---

## Real Mobile Phone Testing (Rear Camera)
Smartphone browsers require HTTPS for camera access when not on `localhost`.
Use a free tunnel such as **ngrok** to test on your phone:
1. `ngrok http 5000` -> Copy the HTTPS backend URL into `frontend/.env` (`VITE_API_BASE_URL=https://....ngrok-free.app`).
2. `ngrok http 5173` -> Open the HTTPS URL in your phone's browser.
3. Tap **Scan Plant**, capture a real leaf with your rear camera, and receive live AI results!
