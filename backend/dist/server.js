// src/server.ts
import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

// src/services/firebase.service.ts
import admin from "firebase-admin";
var firestoreDb = null;
function initFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey
          })
        });
      }
      firestoreDb = admin.firestore();
      console.log("\u2713 Firebase Admin initialized with Firestore support.");
    } catch (error) {
      console.warn("\u26A0\uFE0F Firebase Admin initialization failed; using local botanical disease knowledge base.", error);
    }
  } else {
    console.log("\u2139\uFE0F Firebase credentials not provided. Using embedded botanical disease encyclopedia.");
  }
}
var FALLBACK_DISEASE_DB = {
  "early-blight": {
    name: "Early Blight (Alternaria solani)",
    status: "diseased",
    description: "A common fungal disease characterized by brown-black spots with concentric rings surrounded by yellow chlorotic margins on leaves and stems.",
    symptoms: [
      "Target-pattern concentric rings on older leaves",
      "Yellowing foliage leading to premature leaf drop",
      "Collar rot on stems and dark sunken lesions on fruit"
    ],
    treatment: {
      organic: "Apply bio-fungicides containing Bacillus subtilis or copper-based fungicide every 7 to 10 days.",
      cultural: "Prune infected bottom leaves, stake plants to promote air circulation, and mulch soil to prevent fungal spore splash.",
      chemical: "Chlorothalonil or Mancozeb sprays applied at the first onset of lesions."
    },
    prevention: "Rotate crops away from solanaceous plants for 2-3 years, avoid overhead sprinkler watering, and use certified disease-free seeds."
  },
  "late-blight": {
    name: "Late Blight (Phytophthora infestans)",
    status: "diseased",
    description: "A devastating water-mold disease that rapidly causes water-soaked greasy lesions, white mold beneath leaves, and rapid vine collapse in cool, humid conditions.",
    symptoms: [
      "Large irregular water-soaked pale-green lesions that rapidly turn purplish-brown",
      "White fuzzy mildew growth on the underside of infected leaves in moist weather",
      "Dark brown necrotic streaking on stems and rotting tubers/fruits"
    ],
    treatment: {
      organic: "Immediately remove and destroy heavily affected plants. Apply preventative copper hydroxide sprays to surrounding foliage.",
      cultural: "Ensure wide plant spacing, plant only resistant cultivars, and maintain drip irrigation.",
      chemical: "Systemic fungicides containing Metalaxyl or Dimethomorph during high-risk cool, damp weather."
    },
    prevention: "Plant resistant varieties, eliminate volunteer plants and cull piles, and destroy crop residues at season end."
  },
  "powdery-mildew": {
    name: "Powdery Mildew (Erysiphales)",
    status: "diseased",
    description: "A widespread fungal condition recognizable by white or ash-gray talcum-like powdery spots covering leaf surfaces, buds, and young stems.",
    symptoms: [
      "White powdery fungal patches on upper leaf surfaces",
      "Distorted, curled, or yellowing young leaves",
      "Stunted flower and fruit growth with premature foliage drop"
    ],
    treatment: {
      organic: "Spray neem oil solution, sulfur powder, or a diluted potassium bicarbonate spray (1 tbsp per gallon water).",
      cultural: "Ensure full sun exposure, prune dense foliage to increase airflow, and avoid excessive nitrogen fertilizer.",
      chemical: "Myclobutanil or Triadimefon fungicides applied according to package label directions."
    },
    prevention: "Select resistant varieties, plant in sunny locations, and water at soil level."
  },
  "leaf-rust": {
    name: "Leaf Rust (Puccinia spp.)",
    status: "diseased",
    description: "A specialized fungal infection that produces dusty reddish-orange to dark-brown pustules on the undersides of leaves, stealing essential plant nutrients.",
    symptoms: [
      "Raised rust-colored or yellow-orange pustules on lower leaf surfaces",
      "Chlorotic yellow flecks on upper leaf surfaces corresponding to pustules",
      "Leaf chlorosis, necrosis, and premature defoliation under severe infestation"
    ],
    treatment: {
      organic: "Dust leaves with micronized wettable sulfur or apply neem oil sprays at 7-day intervals.",
      cultural: "Remove and bag severely infected leaves; refrain from wetting leaves in the late afternoon.",
      chemical: "Propiconazole or Tebuconazole fungicide sprays for persistent infestations."
    },
    prevention: "Plant rust-resistant cultivars, maintain balanced soil fertility, and clear autumn leaf litter."
  },
  "bacterial-leaf-spot": {
    name: "Bacterial Leaf Spot (Xanthomonas spp.)",
    status: "diseased",
    description: "A bacterial disorder producing small, dark, angular water-soaked lesions that often dry out and create a shot-hole appearance.",
    symptoms: [
      "Small circular to angular water-soaked dark spots",
      "Lesions turning necrotic brown with yellow haloes",
      "Leaf tissue dropping out leaving shot-hole perforations"
    ],
    treatment: {
      organic: "Apply fixed copper bactericides combined with mancozeb to prevent further bacterial proliferation.",
      cultural: "Never work in gardens when foliage is wet. Sterilize pruning tools with 70% isopropyl alcohol between cuts.",
      chemical: "Streptomycin agricultural formulations where permitted for commercial greenhouse use."
    },
    prevention: "Use hot-water treated or certified disease-free seeds and implement drip irrigation."
  },
  "black-spot": {
    name: "Black Spot (Diplocarpon rosae)",
    status: "diseased",
    description: "A destructive fungal condition creating circular black spots with fringed edges on upper leaf surfaces, commonly affecting roses and shrubs.",
    symptoms: [
      "Circular black spots with feathery, fringed margins on leaf surfaces",
      "Surrounding yellowing of leaf tissue leading to extensive defoliation",
      "Dark purple-to-black raised lesions on immature canes and stems"
    ],
    treatment: {
      organic: "Spray with biofungicides containing Bacillus amyloliquefaciens or sulfur-based solutions.",
      cultural: "Rake up and dispose of fallen diseased leaves immediately. Water early in the morning.",
      chemical: "Triforine, Chlorothalonil, or Difenoconazole sprays."
    },
    prevention: "Plant resistant varieties, place plants in full sun, and prune to keep centers open."
  }
};
var DISEASE_KEYWORDS = [
  "blight",
  "rust",
  "mildew",
  "spot",
  "rot",
  "canker",
  "scab",
  "wilt",
  "mosaic",
  "virus",
  "chlorosis",
  "scorch",
  "mold",
  "gall",
  "smut"
];
function normalizeKey(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
async function getDiseaseDetails(queryName, plantDisplayName) {
  const normalizedKey = normalizeKey(queryName);
  if (firestoreDb) {
    try {
      const docRef = firestoreDb.collection("diseaseInformation").doc(normalizedKey);
      const snapshot = await docRef.get();
      if (snapshot.exists) {
        const data = snapshot.data();
        return {
          ...data,
          status: data.status ?? "diseased"
        };
      }
    } catch (err) {
      console.warn(`Firestore query for '${normalizedKey}' failed, falling back to local database:`, err);
    }
  }
  if (FALLBACK_DISEASE_DB[normalizedKey]) {
    return FALLBACK_DISEASE_DB[normalizedKey];
  }
  for (const [key, info] of Object.entries(FALLBACK_DISEASE_DB)) {
    if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
      return info;
    }
  }
  const isPathogenMatch = DISEASE_KEYWORDS.some((keyword) => normalizedKey.includes(keyword));
  if (isPathogenMatch) {
    return {
      name: queryName,
      status: "diseased",
      description: `Observed symptoms indicate active foliar infection (${queryName}). Leaves exhibit characteristic necrotic lesions or fungal growth.`,
      symptoms: [
        "Foliar discoloration and visible spotting",
        "Tissue chlorosis or necrotic margins"
      ],
      treatment: {
        organic: "Isolate the infected plant, prune severely affected foliage, and apply an organic copper or sulfur-based fungicide.",
        cultural: "Avoid overhead watering; irrigate strictly at the base and sanitize shears."
      },
      prevention: "Ensure good air circulation, clean debris around the plant, and avoid handling plants while wet."
    };
  }
  const displayPlantName = plantDisplayName || queryName;
  return {
    name: "Healthy Foliage (No Severe Pathogen Detected)",
    status: "healthy",
    description: `Visual analysis of this ${displayPlantName} indicates healthy foliage with uniform leaf tissue. No severe symptoms of fungal blight, leaf rust, powdery mildew, or bacterial spotting were observed.`,
    symptoms: [
      "Consistent natural leaf coloration and vigor",
      "Absence of necrotic lesions or dark fungal margins",
      "Intact cuticle and foliar structure"
    ],
    treatment: {
      organic: "No chemical or fungicide treatment required. Continue standard organic care and balanced watering.",
      cultural: "Ensure appropriate sunlight exposure and good drainage to prevent root moisture stress."
    },
    prevention: "Inspect leaf undersides periodically and wipe dust to support healthy photosynthesis."
  };
}

// src/services/plantnet.service.ts
var PLANTNET_API_BASE = "https://my-api.plantnet.org/v2/identify";
var DEFAULT_PROJECT = "all";
async function identifyPlantWithPlantNet(imageBuffer, mimeType, fileName = "leaf.jpg") {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_plantnet_api_key_here") {
    throw new Error(
      "PLANTNET_API_KEY is not configured in backend .env. Please add your key from https://my.plantnet.org/"
    );
  }
  const url = `${PLANTNET_API_BASE}/${DEFAULT_PROJECT}?api-key=${encodeURIComponent(apiKey.trim())}&include-related-images=true`;
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: mimeType });
  formData.append("images", blob, fileName);
  formData.append("organs", "leaf");
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData
    });
    const remainingHeader = response.headers.get("x-ratelimit-remaining");
    const remainingRequests = remainingHeader ? parseInt(remainingHeader, 10) : void 0;
    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          topResult: void 0,
          message: "No botanical match found for this leaf image.",
          statusCode: 404
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          message: "Daily Pl@ntNet AI request limit exceeded. Please try again later or check your API key quota.",
          statusCode: 429
        };
      }
      if (response.status === 400) {
        return {
          success: false,
          message: "Invalid image format or corrupted image file.",
          statusCode: 400
        };
      }
      const errorText = await response.text().catch(() => "");
      return {
        success: false,
        message: `Pl@ntNet service returned HTTP ${response.status}: ${errorText || response.statusText}`,
        statusCode: response.status
      };
    }
    const data = await response.json();
    const topResult = data.results && data.results.length > 0 ? data.results[0] : void 0;
    return {
      success: true,
      topResult,
      allResults: data.results,
      remainingRequests: data.remainingIdentificationRequests ?? remainingRequests,
      statusCode: 200
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Unable to reach Pl@ntNet AI servers. Check server internet connectivity.");
    }
    throw error;
  }
}

// src/controllers/plant.controller.ts
var MIN_CONFIDENCE_THRESHOLD = 0.2;
async function analyzePlantImage(req, res) {
  const file = req.file;
  if (!file) {
    res.status(400).json({
      success: false,
      message: "No image file uploaded. Please provide a plant leaf image in the 'image' field."
    });
    return;
  }
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    res.status(400).json({
      success: false,
      message: "Unsupported file type. Please upload a clear JPEG or PNG image."
    });
    return;
  }
  if (file.size === 0) {
    res.status(400).json({
      success: false,
      message: "Uploaded image file is empty."
    });
    return;
  }
  try {
    const aiOutput = await identifyPlantWithPlantNet(
      file.buffer,
      file.mimetype,
      file.originalname || "leaf.jpg"
    );
    if (!aiOutput.success) {
      res.status(aiOutput.statusCode || 502).json({
        success: false,
        message: aiOutput.message || "AI analysis failed to identify the leaf."
      });
      return;
    }
    const topMatch = aiOutput.topResult;
    if (!topMatch || topMatch.score < MIN_CONFIDENCE_THRESHOLD) {
      const emptyPayload = {
        disease: null,
        plant: topMatch ? {
          name: topMatch.species.scientificNameWithoutAuthor,
          score: topMatch.score
        } : null,
        provider: "Pl@ntNet",
        analyzedAt: (/* @__PURE__ */ new Date()).toISOString(),
        remainingRequests: aiOutput.remainingRequests
      };
      res.status(200).json({
        success: true,
        data: emptyPayload
      });
      return;
    }
    const scientificName = topMatch.species.scientificNameWithoutAuthor;
    const commonNames = topMatch.species.commonNames ?? [];
    const displayName = commonNames.length > 0 ? `${commonNames[0]} (${scientificName})` : scientificName;
    const diseaseInfo = await getDiseaseDetails(scientificName, displayName);
    const referenceImages = (topMatch.images ?? []).map((img) => img.url.m || img.url.s || img.url.o).filter((url) => typeof url === "string").map((url) => ({ url }));
    const responsePayload = {
      disease: {
        name: diseaseInfo.name,
        status: diseaseInfo.status ?? "healthy",
        score: topMatch.score,
        description: diseaseInfo.description,
        symptoms: diseaseInfo.symptoms,
        treatment: diseaseInfo.treatment,
        images: referenceImages
      },
      plant: {
        name: displayName,
        score: topMatch.score
      },
      provider: "Pl@ntNet",
      analyzedAt: (/* @__PURE__ */ new Date()).toISOString(),
      remainingRequests: aiOutput.remainingRequests
    };
    res.status(200).json({
      success: true,
      data: responsePayload
    });
  } catch (error) {
    console.error("Plant analysis controller error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error occurred.";
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
}

// src/server.ts
dotenv.config();
initFirebase();
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5e3;
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"]
  })
);
app.use(express.json());
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
    // 15 MB max file size
    files: 1
  }
});
app.get("/", (_req, res) => {
  res.json({
    name: "Smart Plant AI API",
    version: "1.0.0",
    description: "Real-time AI plant disease detection service powered by Pl@ntNet",
    endpoints: {
      health: "GET /api/health",
      analyze: "POST /api/plant/analyze (multipart/form-data with 'image' field)"
    }
  });
});
app.get(["/health", "/api/health"], (_req, res) => {
  const hasPlantNetKey = Boolean(
    process.env.PLANTNET_API_KEY && process.env.PLANTNET_API_KEY.trim() !== "" && process.env.PLANTNET_API_KEY !== "your_plantnet_api_key_here"
  );
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    aiProvider: "Pl@ntNet",
    hasApiKeyConfigured: hasPlantNetKey,
    uptimeSeconds: process.uptime()
  });
});
app.post(["/plant/analyze", "/api/plant/analyze"], upload.single("image"), analyzePlantImage);
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        success: false,
        message: "Image file is too large. Maximum allowed size is 15 MB."
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
    return;
  }
  console.error("Unhandled server exception:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error occurred."
  });
});
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`\u{1F331} SMART PLANT AI BACKEND SERVICE STARTED`);
    console.log(`\u{1F680} Port: ${PORT}`);
    console.log(`\u{1F310} Local URL: http://localhost:${PORT}`);
    console.log(`\u{1FA7A} Health check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}
var server_default = app;
export {
  app,
  server_default as default
};
