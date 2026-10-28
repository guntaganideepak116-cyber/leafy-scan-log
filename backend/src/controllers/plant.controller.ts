import type { Request, Response } from "express";
import { identifyPlantWithPlantNet } from "../services/plantnet.service.js";
import { getDiseaseDetails } from "../services/firebase.service.js";
import type { AnalysisResponseData } from "../types/index.js";

const MIN_CONFIDENCE_THRESHOLD = 0.20;

export async function analyzePlantImage(req: Request, res: Response): Promise<void> {
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      message: "No image file uploaded. Please provide a plant leaf image in the 'image' field.",
    });
    return;
  }

  // Validate MIME type
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    res.status(400).json({
      success: false,
      message: "Unsupported file type. Please upload a clear JPEG or PNG image.",
    });
    return;
  }

  // Validate non-zero file size
  if (file.size === 0) {
    res.status(400).json({
      success: false,
      message: "Uploaded image file is empty.",
    });
    return;
  }

  try {
    // 1. Invoke real Pl@ntNet AI inference
    const aiOutput = await identifyPlantWithPlantNet(
      file.buffer,
      file.mimetype,
      file.originalname || "leaf.jpg"
    );

    if (!aiOutput.success) {
      res.status(aiOutput.statusCode || 502).json({
        success: false,
        message: aiOutput.message || "AI analysis failed to identify the leaf.",
      });
      return;
    }

    const topMatch = aiOutput.topResult;

    // 2. Handle low-confidence or no-match results cleanly
    if (!topMatch || topMatch.score < MIN_CONFIDENCE_THRESHOLD) {
      const emptyPayload: AnalysisResponseData = {
        disease: null,
        plant: topMatch
          ? {
              name: topMatch.species.scientificNameWithoutAuthor,
              score: topMatch.score,
            }
          : null,
        provider: "Pl@ntNet",
        analyzedAt: new Date().toISOString(),
        remainingRequests: aiOutput.remainingRequests,
      };

      res.status(200).json({
        success: true,
        data: emptyPayload,
      });
      return;
    }

    // 3. Extract plant details
    const scientificName = topMatch.species.scientificNameWithoutAuthor;
    const commonNames = topMatch.species.commonNames ?? [];
    const displayName = commonNames.length > 0 ? `${commonNames[0]} (${scientificName})` : scientificName;

    // 4. Enrich diagnosis with Firestore / Botanical disease database
    const diseaseInfo = await getDiseaseDetails(scientificName, displayName);

    // 5. Gather reference images from Pl@ntNet result
    const referenceImages: Array<{ url: string }> = (topMatch.images ?? [])
      .map((img) => img.url.m || img.url.s || img.url.o)
      .filter((url): url is string => typeof url === "string")
      .map((url) => ({ url }));

    // 6. Build final payload matching frontend contract
    const responsePayload: AnalysisResponseData = {
      disease: {
        name: diseaseInfo.name,
        status: diseaseInfo.status ?? "healthy",
        score: topMatch.score,
        description: diseaseInfo.description,
        symptoms: diseaseInfo.symptoms,
        treatment: diseaseInfo.treatment,
        images: referenceImages,
      },
      plant: {
        name: displayName,
        score: topMatch.score,
      },
      provider: "Pl@ntNet",
      analyzedAt: new Date().toISOString(),
      remainingRequests: aiOutput.remainingRequests,
    };

    res.status(200).json({
      success: true,
      data: responsePayload,
    });
  } catch (error) {
    console.error("Plant analysis controller error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error occurred.";

    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}
