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

## 3-Step Quick Start (Local Development)

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

## Deploy to Vercel (Project Name: `smartplant-ai`)

Both the frontend PWA and the backend Express API deploy together under a **single unified Vercel deployment** with zero CORS configuration needed:

### Option A: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new) and log in.
2. Select repository: **`guntaganideepak116-cyber/leafy-scan-log`**.
3. In **Project Name**, enter exactly:
   ```
   smartplant-ai
   ```
4. Leave **Framework Preset** as **Other** (configured automatically by `vercel.json`).
5. Open **Environment Variables** and add:
   - `PLANTNET_API_KEY`: Your key from [my.plantnet.org](https://my.plantnet.org/)
   - *(Optional Firebase keys if syncing Firestore)*:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_PRIVATE_KEY`
6. Click **Deploy**.
   Your application will be live at `https://smartplant-ai.vercel.app`!

### Option B: Via Vercel CLI
```bash
# In the root project directory:
npx vercel --prod
```
When prompted for project name, specify:
`smartplant-ai`

---

## Real Mobile Phone Testing (Rear Camera & PWA Installation)
Smartphone browsers require HTTPS for camera and service worker features.
When deployed on Vercel (`https://smartplant-ai.vercel.app`):
1. Open the URL in Safari (iOS) or Chrome (Android).
2. Tap **Install App** on the native popup prompt to add it to your home screen.
3. Tap **Scan Plant** to analyze plant leaves directly with your phone's camera!

