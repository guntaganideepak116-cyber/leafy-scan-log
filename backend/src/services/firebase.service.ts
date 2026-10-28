import type { DiseaseInfo } from "../types/index.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let firestoreDb: any = null;
let firebaseInitialized = false;

// Initialize Firebase Admin dynamically and safely if environment variables are set
export async function initFirebase(): Promise<void> {
  if (firebaseInitialized) return;
  firebaseInitialized = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      privateKey = privateKey.replace(/\\n/g, "\n");
      const adminModule = await import("firebase-admin");
      const admin = adminModule.default || adminModule;
      if (!admin.apps || !admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
      firestoreDb = admin.firestore();
      console.log("✓ Firebase Admin initialized with Firestore support.");
    } catch (error) {
      console.warn("⚠️ Firebase Admin initialization failed; using local botanical disease encyclopedia.", error);
    }
  } else {
    console.log("ℹ️ Firebase credentials not provided. Using embedded botanical disease encyclopedia.");
  }
}

// Built-in disease knowledge repository (syncable with Firestore diseaseInformation collection)
const FALLBACK_DISEASE_DB: Record<string, DiseaseInfo> = {
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

const DISEASE_KEYWORDS = [
  "blight", "rust", "mildew", "spot", "rot", "canker", "scab", "wilt",
  "mosaic", "virus", "chlorosis", "scorch", "mold", "gall", "smut"
];

/**
 * Normalizes an AI disease or condition string to a matching lookup key
 */
function normalizeKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Retrieves disease information either from Firestore or the botanical encyclopedia
 */
export async function getDiseaseDetails(queryName: string, plantDisplayName?: string): Promise<DiseaseInfo> {
  await initFirebase().catch(() => {});
  const normalizedKey = normalizeKey(queryName);

  // 1. Try querying live Firestore if initialized
  if (firestoreDb) {
    try {
      const docRef = firestoreDb.collection("diseaseInformation").doc(normalizedKey);
      const snapshot = await docRef.get();
      if (snapshot.exists) {
        const data = snapshot.data() as DiseaseInfo;
        return {
          ...data,
          status: data.status ?? "diseased",
        };
      }
    } catch (err) {
      console.warn(`Firestore query for '${normalizedKey}' failed, falling back to local database:`, err);
    }
  }

  // 2. Check local knowledge base for direct key match
  if (FALLBACK_DISEASE_DB[normalizedKey]) {
    return FALLBACK_DISEASE_DB[normalizedKey];
  }

  // 3. Check for partial matches (e.g. "early blight" in "tomato early blight")
  for (const [key, info] of Object.entries(FALLBACK_DISEASE_DB)) {
    if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
      return info;
    }
  }

  // 4. Check if the name contains specific pathological disease keywords
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
        cultural: "Avoid overhead watering; irrigate strictly at the base and sanitize shears.",
      },
      prevention: "Ensure good air circulation, clean debris around the plant, and avoid handling plants while wet."
    };
  }

  // 5. Default: The AI recognized a healthy plant species (no disease symptoms detected)
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
      cultural: "Ensure appropriate sunlight exposure and good drainage to prevent root moisture stress.",
    },
    prevention: "Inspect leaf undersides periodically and wipe dust to support healthy photosynthesis."
  };
}
