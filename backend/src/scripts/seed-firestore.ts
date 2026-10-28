import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase credentials in backend/.env!");
  console.error("Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY first.");
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
} catch (err) {
  console.error("❌ Failed to initialize Firebase Admin:", err);
  process.exit(1);
}

const db = admin.firestore();

const DISEASE_COLLECTION = "diseaseInformation";

const SEED_DATA = [
  {
    id: "early-blight",
    data: {
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
    }
  },
  {
    id: "late-blight",
    data: {
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
    }
  },
  {
    id: "powdery-mildew",
    data: {
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
    }
  },
  {
    id: "leaf-rust",
    data: {
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
    }
  },
  {
    id: "bacterial-leaf-spot",
    data: {
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
    }
  },
  {
    id: "black-spot",
    data: {
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
  }
];

async function seedFirestore() {
  console.log(`🌱 Seeding Firestore collection '${DISEASE_COLLECTION}'...`);
  const batch = db.batch();

  for (const item of SEED_DATA) {
    const docRef = db.collection(DISEASE_COLLECTION).doc(item.id);
    batch.set(docRef, item.data, { merge: true });
    console.log(`  ✓ Queued: ${item.id} -> ${item.data.name}`);
  }

  await batch.commit();
  console.log(`✅ Success! All ${SEED_DATA.length} disease records successfully stored in Firestore!`);
  process.exit(0);
}

seedFirestore().catch((err) => {
  console.error("❌ Error seeding Firestore:", err);
  process.exit(1);
});
