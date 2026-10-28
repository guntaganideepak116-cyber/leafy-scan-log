export interface DiseaseInfo {
  name: string;
  status?: "healthy" | "diseased" | "foliar_stress";
  description: string;
  symptoms?: string[];
  treatment?: {
    organic?: string;
    chemical?: string;
    cultural?: string;
  };
  prevention?: string;
}

export interface PlantNetResult {
  score: number;
  species: {
    scientificNameWithoutAuthor: string;
    scientificNameAuthorship?: string;
    genus?: {
      scientificNameWithoutAuthor: string;
    };
    family?: {
      scientificNameWithoutAuthor: string;
    };
    commonNames?: string[];
  };
  images?: Array<{
    organ: string;
    author: string;
    license: string;
    date: {
      timestamp: number;
      string: string;
    };
    url: {
      o?: string;
      m?: string;
      s?: string;
    };
  }>;
}

export interface PlantNetApiResponse {
  query?: {
    project: string;
    images: string[];
    organs: string[];
  };
  language?: string;
  preferedReferential?: string;
  bestMatch?: string;
  results?: PlantNetResult[];
  remainingIdentificationRequests?: number;
}

export interface AnalysisResponseData {
  disease: {
    name: string;
    status?: "healthy" | "diseased" | "foliar_stress";
    score: number;
    description: string;
    symptoms?: string[];
    treatment?: {
      organic?: string;
      chemical?: string;
      cultural?: string;
    };
    images: Array<{ url: string }>;
  } | null;
  plant: {
    name: string;
    score: number;
  } | null;
  provider: string;
  analyzedAt: string;
  remainingRequests?: number;
}
