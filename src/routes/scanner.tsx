import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, ScanSearch } from "lucide-react";

import { AnalysisLoader } from "@/components/analysis-loader";
import { ErrorState } from "@/components/states";
import { useOnlineStatus } from "@/components/offline-banner";
import { Button } from "@/components/ui/button";
import { usePlantApp } from "@/components/plant-app-provider";
import {
  describeAnalysisError,
  isValidPlantImage,
  parsePlantAnalysis,
} from "@/lib/plant-analysis";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scan a Plant — Smart Plant AI" },
      {
        name: "description",
        content: "Use your camera to capture a plant photo and send it for real AI disease analysis.",
      },
      { property: "og:title", content: "Scan a Plant — Smart Plant AI" },
      {
        property: "og:description",
        content: "Use your camera to capture a plant photo and send it for real AI disease analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScannerPage,
});

type CameraStatus = "requesting" | "active" | "denied" | "unavailable" | "insecure";

function ScannerPage() {
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const { session, setCapturedImage, saveAnalysis, clearCurrentScan } = usePlantApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("requesting");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    if (!window.isSecureContext) {
      setCameraStatus("insecure");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unavailable");
      return;
    }
    setCameraStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraStatus("active");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setCameraStatus(
        name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable",
      );
    }
  }, []);

  useEffect(() => {
    if (!session.capturedFile) void startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `plant-scan-${Date.now()}.jpg`, { type: "image/jpeg" });
        if (!isValidPlantImage(file)) {
          setError("Choose a clear JPEG or PNG photo to analyze.");
          return;
        }
        setError(null);
        stopCamera();
        setCapturedImage(file);
      },
      "image/jpeg",
      0.9,
    );
  }, [setCapturedImage, stopCamera]);

  const retake = useCallback(() => {
    clearCurrentScan();
    void startCamera();
  }, [clearCurrentScan, startCamera]);

  const analyze = useCallback(async () => {
    const file = session.capturedFile;
    if (!file || analyzing) return;
    if (!online) {
      setError("Internet connection required for AI analysis.");
      return;
    }
    if (!isValidPlantImage(file)) {
      setError("Choose a clear JPEG or PNG photo to analyze.");
      return;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!baseUrl) {
      setError(describeAnalysisError(new Error("backend_unavailable")));
      return;
    }

    setAnalyzing(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/plant/analyze`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(response.status === 413 ? "image_too_large" : "analysis_failed");
      }
      const analysis = parsePlantAnalysis(await response.json());
      saveAnalysis(analysis);
      void navigate({ to: "/result" });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(describeAnalysisError(new Error("request_timeout")));
      } else {
        setError(describeAnalysisError(err));
      }
    } finally {
      clearTimeout(timeout);
      setAnalyzing(false);
    }
  }, [session.capturedFile, analyzing, online, saveAnalysis, navigate]);

  const guidance = (
    <ul className="mt-4 space-y-1 text-sm text-muted-foreground" aria-label="Photo guidance">
      <li>• Fill the frame with a single affected leaf.</li>
      <li>• Use good, even light — avoid harsh shadows.</li>
      <li>• Hold steady so the photo is sharp.</li>
    </ul>
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-28 pt-6">
      <h1 className="text-2xl font-semibold text-foreground">Scan your plant</h1>

      {error ? (
        <ErrorState
          message={error}
          actionLabel={session.capturedFile ? "Try again" : undefined}
          onAction={session.capturedFile ? () => setError(null) : undefined}
        />
      ) : null}

      {analyzing ? (
        <AnalysisLoader />
      ) : session.capturedFile && session.imageUrl ? (
        <section aria-label="Captured photo preview" className="flex flex-col gap-4">
          <img
            src={session.imageUrl}
            alt="Captured plant photo ready for analysis"
            className="w-full rounded-2xl border border-border object-cover"
          />
          {guidance}
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="min-h-11 flex-1 gap-2" onClick={retake}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Retake
            </Button>
            <Button size="lg" className="min-h-11 flex-1 gap-2" onClick={analyze} disabled={!online}>
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              Analyze Plant
            </Button>
          </div>
          {!online ? (
            <p className="text-center text-sm text-muted-foreground">
              Internet connection required for AI analysis.
            </p>
          ) : null}
        </section>
      ) : cameraStatus === "active" ? (
        <section aria-label="Live camera view" className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              aria-label="Live camera preview"
              className="aspect-[3/4] w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-white/60"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Center one leaf inside the frame, then capture.
          </p>
          <Button size="lg" className="min-h-12 gap-2" onClick={capture} aria-label="Capture photo">
            <Camera className="h-5 w-5" aria-hidden="true" />
            Capture
          </Button>
        </section>
      ) : (
        <ErrorState
          title={
            cameraStatus === "denied"
              ? "Camera permission denied"
              : cameraStatus === "insecure"
                ? "Secure connection required"
                : cameraStatus === "unavailable"
                  ? "Camera unavailable"
                  : "Starting camera..."
          }
          message={
            cameraStatus === "denied"
              ? "Allow camera access in your browser settings, then try again."
              : cameraStatus === "insecure"
                ? "The camera only works over a secure (HTTPS) connection."
                : cameraStatus === "unavailable"
                  ? "No camera was found on this device, or it is in use by another app."
                  : "Please allow camera access when prompted."
          }
          actionLabel={cameraStatus === "requesting" ? undefined : "Try again"}
          onAction={cameraStatus === "requesting" ? undefined : () => void startCamera()}
        />
      )}
    </main>
  );
}
