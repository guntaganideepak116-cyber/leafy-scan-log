import type { PlantNetApiResponse, PlantNetResult } from "../types/index.js";

const PLANTNET_API_BASE = "https://my-api.plantnet.org/v2/identify";
const DEFAULT_PROJECT = "all";

export interface PlantNetIdentificationOutput {
  success: boolean;
  topResult?: PlantNetResult;
  allResults?: PlantNetResult[];
  remainingRequests?: number;
  message?: string;
  statusCode?: number;
}

/**
 * Sends a plant leaf image buffer to the real Pl@ntNet API for identification
 */
export async function identifyPlantWithPlantNet(
  imageBuffer: Buffer,
  mimeType: string,
  fileName: string = "leaf.jpg"
): Promise<PlantNetIdentificationOutput> {
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
      body: formData,
    });

    const remainingHeader = response.headers.get("x-ratelimit-remaining");
    const remainingRequests = remainingHeader ? parseInt(remainingHeader, 10) : undefined;

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          topResult: undefined,
          message: "No botanical match found for this leaf image.",
          statusCode: 404,
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          message: "Daily Pl@ntNet AI request limit exceeded. Please try again later or check your API key quota.",
          statusCode: 429,
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          message: "Invalid image format or corrupted image file.",
          statusCode: 400,
        };
      }

      const errorText = await response.text().catch(() => "");
      return {
        success: false,
        message: `Pl@ntNet service returned HTTP ${response.status}: ${errorText || response.statusText}`,
        statusCode: response.status,
      };
    }

    const data = (await response.json()) as PlantNetApiResponse;
    const topResult = data.results && data.results.length > 0 ? data.results[0] : undefined;

    return {
      success: true,
      topResult,
      allResults: data.results,
      remainingRequests: data.remainingIdentificationRequests ?? remainingRequests,
      statusCode: 200,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Unable to reach Pl@ntNet AI servers. Check server internet connectivity.");
    }
    throw error;
  }
}
