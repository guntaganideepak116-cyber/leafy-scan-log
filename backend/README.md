# Smart Plant AI — Backend Service

The Node.js + Express (TypeScript) backend for the **Smart Plant AI** disease detection system. It connects to the real Pl@ntNet AI Identification API and enriches results with botanical care information from Firebase Firestore.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and paste your free Pl@ntNet API Key:
```env
PORT=5000
PLANTNET_API_KEY=your_actual_plantnet_api_key
```

> **How to get a free Pl@ntNet API Key:**
> 1. Register at [https://my.plantnet.org/](https://my.plantnet.org/)
> 2. Go to your account dashboard and copy your API Key.
> 3. Paste it into `.env`.

### 3. Run Development Server
```bash
npm run dev
```
The server will start at: `http://localhost:5000`

---

## API Endpoints

### 1. Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-10-28T04:45:00.000Z",
  "aiProvider": "Pl@ntNet",
  "hasApiKeyConfigured": true,
  "uptimeSeconds": 12.4
}
```

### 2. Analyze Plant Leaf
```http
POST /api/plant/analyze
Content-Type: multipart/form-data
```
**Body (FormData):**
- `image`: Binary image file (JPEG or PNG)

**Response:**
```json
{
  "success": true,
  "data": {
    "disease": {
      "name": "Early Blight (Alternaria solani)",
      "score": 0.89,
      "description": "A common fungal disease characterized by brown-black spots with concentric rings...",
      "symptoms": [
        "Target-pattern concentric rings on older leaves",
        "Yellowing foliage leading to premature leaf drop"
      ],
      "treatment": {
        "organic": "Apply bio-fungicides containing Bacillus subtilis or copper-based fungicide.",
        "cultural": "Prune infected bottom leaves, stake plants to promote air circulation."
      },
      "images": [
        { "url": "https://images.plantnet.org/..." }
      ]
    },
    "plant": {
      "name": "Tomato (Solanum lycopersicum)",
      "score": 0.89
    },
    "provider": "Pl@ntNet",
    "analyzedAt": "2026-10-28T04:45:00.000Z"
  }
}
```

---

## Firebase Firestore Integration (Optional)

If you wish to use Firebase Firestore for custom disease articles:
1. In Firebase Console, create a service account under **Project Settings -> Service accounts**.
2. Download the JSON key.
3. Fill in `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `.env`.
4. Create a `diseaseInformation` collection with document IDs like `early-blight`, `late-blight`, `powdery-mildew`, `leaf-rust`.
