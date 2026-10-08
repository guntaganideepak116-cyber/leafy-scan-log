export type PlantDisease = {
  name?: string;
  score?: number;
  description?: string;
  images?: Array<{ url?: string; [key: string]: unknown }>;
  [key: string]: unknown;
};

export type PlantSpecies = {
  name?: string;
  score?: number;
  [key: string]: unknown;
};

export type PlantAnalysis = {
  disease?: PlantDisease | null;
  plant?: PlantSpecies | null;
  provider?: string;
  analyzedAt?: string;
  [key: string]: unknown;
};

export type ScanRecord = {
  id: string;
  analyzedAt: string;
  analysis: PlantAnalysis | null;
};

export const SCAN_HISTORY_KEY = "smart-plant-ai-scans";
export const MIN_DISEASE_CONFIDENCE = 0.2;
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

export function isValidPlantImage(image: File | null | undefined): image is File {
  return Boolean(
    image &&
      image.size > 0 &&
      image.size <= MAX_IMAGE_BYTES &&
      ["image/jpeg", "image/png"].includes(image.type.toLowerCase()),
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function parsePlantAnalysis(payload: unknown): PlantAnalysis {
  const outer = asRecord(payload);
  if (!outer || outer["success"] === false) {
    throw new Error(typeof outer?.["message"] === "string" ? outer["message"] : "analysis_failed");
  }

  const data = asRecord(outer["data"]) ?? outer;
  const disease = asRecord(data["disease"]);
  const plant = asRecord(data["plant"]);

  return {
    ...data,
    disease: disease as PlantDisease | null,
    plant: plant as PlantSpecies | null,
    ...(typeof data["provider"] === "string" ? { provider: data["provider"] } : {}),
    ...(typeof data["analyzedAt"] === "string" ? { analyzedAt: data["analyzedAt"] } : {}),
  };
}

export function hasConfidentDisease(analysis: PlantAnalysis | null): boolean {
  const disease = analysis?.disease;
  return Boolean(
    disease &&
      typeof disease.name === "string" &&
      disease.name.trim().length > 0 &&
      typeof disease.score === "number" &&
      Number.isFinite(disease.score) &&
      disease.score >= MIN_DISEASE_CONFIDENCE &&
      disease.score <= 1,
  );
}

export function readScanHistory(): ScanRecord[] {
  try {
    const raw = window.localStorage.getItem(SCAN_HISTORY_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (record): record is ScanRecord =>
            record !== null &&
            typeof record === "object" &&
            typeof record.id === "string" &&
            typeof record.analyzedAt === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function saveScanHistory(analysis: PlantAnalysis | null): ScanRecord {
  const record: ScanRecord = {
    id: crypto.randomUUID(),
    analyzedAt: analysis?.analyzedAt ?? new Date().toISOString(),
    analysis,
  };

  try {
    const history = readScanHistory();
    window.localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify([record, ...history].slice(0, 50)));
  } catch {
    // AI results remain visible even when the browser disables local history.
  }

  return record;
}

export function describeAnalysisError(error: unknown): string {
  if (error instanceof TypeError) {
    return "We couldn't reach the analysis service. Check your internet connection and try again.";
  }

  if (error instanceof Error) {
    if (error.message === "analysis_failed") return "The analysis service couldn't identify this image.";
    if (error.message === "image_too_large") return "Choose a smaller image under 12 MB and try again.";
    if (error.message === "invalid_image") return "Choose a clear JPEG or PNG photo to analyze.";
    if (error.message === "backend_unavailable") return "Plant analysis isn't connected yet. Add your backend address to continue.";
    if (error.message === "request_timeout") return "The analysis took too long. Check your connection and try again.";
  }

  return "We couldn't complete the AI analysis. Please try again.";
}