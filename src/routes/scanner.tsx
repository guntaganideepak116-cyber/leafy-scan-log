import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  History,
  RotateCcw,
  ScanSearch,
  Upload,
  RefreshCw,
  Sparkles,
  FileText,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { AnalysisLoader } from "@/components/analysis-loader";
import { ConfidenceBar } from "@/components/confidence-bar";
import { EmptyState, ErrorState } from "@/components/states";
import { useOnlineStatus } from "@/components/offline-banner";
import { Button } from "@/components/ui/button";
import { usePlantApp } from "@/components/plant-app-provider";
import {
  describeAnalysisError,
  hasConfidentDisease,
  isValidPlantImage,
  parsePlantAnalysis,
  type PlantAnalysis,
} from "@/lib/plant-analysis";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scan a Plant Leaf — Smart Plant AI" },
      {
        name: "description",
        content:
          "Use your camera to capture a plant photo and send it for real AI disease analysis.",
      },
      { property: "og:title", content: "Scan a Plant — Smart Plant AI" },
      {
        property: "og:description",
        content:
          "Use your camera to capture a plant photo and send it for real AI disease analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScannerPage,
});

type CameraStatus = "requesting" | "active" | "denied" | "unavailable" | "insecure";

function ScannerPage() {
  const online = useOnlineStatus();
  const navigate = useNavigate();
  const { session, setCapturedImage, saveAnalysis, clearCurrentScan } = usePlantApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("requesting");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<PlantAnalysis | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(
    async (mode: "environment" | "user" = facingMode) => {
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
        stopCamera();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
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
    },
    [facingMode, stopCamera],
  );

  useEffect(() => {
    if (!session.capturedFile && !scanResult) void startCamera("environment");
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCameraFacing = useCallback(() => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    void startCamera(nextMode);
  }, [facingMode, startCamera]);

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
        setScanResult(null);
        stopCamera();
        setCapturedImage(file);
      },
      "image/jpeg",
      0.9,
    );
  }, [setCapturedImage, stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!isValidPlantImage(file)) {
      setError("Please choose a valid JPEG or PNG image under 12MB.");
      return;
    }
    setError(null);
    setScanResult(null);
    stopCamera();
    setCapturedImage(file);
  };

  const retake = useCallback(() => {
    setScanResult(null);
    clearCurrentScan();
    void startCamera(facingMode);
  }, [clearCurrentScan, facingMode, startCamera]);

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
        let serverErrorMsg: string | null = null;
        try {
          const errData = await response.json();
          if (typeof errData?.message === "string") {
            serverErrorMsg = errData.message;
          }
        } catch {
          // ignore non-json response body
        }
        if (serverErrorMsg) {
          throw new Error(serverErrorMsg);
        }
        throw new Error(response.status === 413 ? "image_too_large" : "analysis_failed");
      }
      const analysis = parsePlantAnalysis(await response.json());
      saveAnalysis(analysis);
      setScanResult(analysis);
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
  }, [session.capturedFile, analyzing, online, saveAnalysis]);

  const confident = scanResult ? hasConfidentDisease(scanResult) : false;
  const disease = scanResult?.disease;
  const plant = scanResult?.plant;
  const isHealthy =
    disease?.["status"] === "healthy" ||
    (typeof disease?.name === "string" && disease.name.toLowerCase().includes("healthy"));
  const treatment = disease?.["treatment"] as
    { organic?: string; cultural?: string; chemical?: string } | undefined;

  return (
    <main className="flex w-full flex-col gap-4 px-4 pt-3">
      {/* Hidden file input for photo uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            aria-label="Back to home"
          >
            <Link to="/">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              {scanResult ? "Diagnosis Result" : "Scan Plant Leaf"}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {scanResult ? "Pl@ntNet Real Inference" : "Live Camera Viewfinder"}
            </p>
          </div>
        </div>

        {scanResult ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={retake}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            New Scan
          </Button>
        ) : null}
      </div>

      {error ? (
        <ErrorState
          message={error}
          actionLabel={session.capturedFile ? "Try again" : undefined}
          onAction={session.capturedFile ? () => setError(null) : undefined}
        />
      ) : null}

      {/* ── 1. INSTANT RESULT VIEW ── */}
      {scanResult ? (
        <section aria-label="Analysis Result" className="flex flex-col gap-4 animate-in fade-in">
          {session.imageUrl ? (
            <div className="relative overflow-hidden rounded-2xl border border-border shadow-md">
              <img
                src={session.imageUrl}
                alt="Scanned plant leaf"
                className="max-h-64 w-full object-cover"
              />
              <span className="absolute bottom-2 right-2 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white">
                Scanned Photo
              </span>
            </div>
          ) : null}

          {confident && disease ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {isHealthy ? "Health Status" : "Disease Detected"}
                  </span>
                  <h2 className="text-xl font-extrabold text-foreground leading-tight mt-0.5">
                    {disease.name}
                  </h2>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isHealthy
                      ? "border border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "border border-destructive/20 bg-destructive/10 text-destructive"
                  }`}
                >
                  {isHealthy ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Healthy
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      Infected
                    </>
                  )}
                </span>
              </div>

              {typeof disease.score === "number" ? <ConfidenceBar score={disease.score} /> : null}

              {plant?.name ? (
                <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Plant:</span>
                  <span>{plant.name}</span>
                  {typeof plant.score === "number" && (
                    <span className="text-[10px] font-medium text-emerald-600">
                      ({Math.round(plant.score * 100)}% match)
                    </span>
                  )}
                </div>
              ) : null}

              {disease.description ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {disease.description}
                </p>
              ) : null}

              {treatment && (treatment.organic || treatment.cultural) ? (
                <div className="rounded-xl border border-border bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-1.5 text-xs">
                  <p className="font-bold text-foreground flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    {isHealthy ? "Maintenance Advice" : "Recommended Remedies"}
                  </p>
                  {treatment.organic && (
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Organic: </strong>
                      {treatment.organic}
                    </p>
                  )}
                  {treatment.cultural && (
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Cultural: </strong>
                      {treatment.cultural}
                    </p>
                  )}
                </div>
              ) : null}

              {/* Action: Open Result Page for Full Medical PDF */}
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  asChild
                  className="w-full gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 shadow-md shadow-emerald-600/20"
                >
                  <Link to="/result">
                    <FileText className="h-4 w-4" />
                    View Full Medical PDF Report
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={retake} className="rounded-xl">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Scan Another Leaf
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Unable to confidently identify disease"
              message="The AI could not identify this leaf with high certainty. Try taking a closer, sharper photo in good daylight."
            />
          )}
        </section>
      ) : analyzing ? (
        /* ── 2. LOADING STATE ── */
        <AnalysisLoader />
      ) : session.capturedFile && session.imageUrl ? (
        /* ── 3. CAPTURED PREVIEW BEFORE ANALYSIS ── */
        <section aria-label="Captured photo preview" className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-md">
            <img
              src={session.imageUrl}
              alt="Captured plant photo"
              className="max-h-80 w-full object-cover"
            />
            <span className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white">
              Leaf Photo Captured
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 space-y-1 text-xs">
            <p className="font-bold text-foreground">Checklist for best diagnosis:</p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Leaf clearly in frame
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Sharp & in focus
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 rounded-xl font-semibold"
              onClick={retake}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Retake
            </Button>
            <Button
              size="lg"
              className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
              onClick={analyze}
              disabled={!online}
            >
              <ScanSearch className="h-4 w-4 mr-1.5" />
              Analyze with AI
            </Button>
          </div>
        </section>
      ) : cameraStatus === "active" ? (
        /* ── 4. LIVE NATIVE CAMERA VIEWFINDER ── */
        <section aria-label="Live camera view" className="flex flex-col gap-3">
          {/* Viewfinder Window */}
          <div className="relative aspect-3/4 w-full overflow-hidden rounded-3xl border-2 border-emerald-500/20 bg-black shadow-2xl">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              aria-label="Live camera preview"
              className="h-full w-full object-cover"
            />

            {/* Viewfinder HUD: Corner target brackets */}
            <div className="pointer-events-none absolute inset-6 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="h-7 w-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="h-7 w-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              </div>

              {/* Sweeping Laser Scan Line */}
              <div className="laser-scan-line" />

              <div className="flex justify-between">
                <div className="h-7 w-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="h-7 w-7 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
              </div>
            </div>

            {/* Centered guidance pill */}
            <div className="pointer-events-none absolute bottom-4 inset-x-0 flex justify-center">
              <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white shadow">
                Center the diseased leaf inside the frame
              </span>
            </div>
          </div>

          {/* Native Shutter & Camera Controls */}
          <div className="flex items-center justify-around py-3 px-4 rounded-2xl bg-card border border-border/50 shadow-md">
            {/* Gallery Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
              aria-label="Upload photo from gallery"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/60">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold">Gallery</span>
            </button>

            {/* Shutter Button (Center Camera Action) */}
            <button
              type="button"
              onClick={capture}
              className="relative flex h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-emerald-600 shadow-xl shadow-emerald-600/30 active:scale-90 transition-transform"
              aria-label="Capture photo"
            >
              <div className="h-12 w-12 rounded-full bg-white shadow-inner flex items-center justify-center">
                <Camera className="h-6 w-6 text-emerald-700" />
              </div>
            </button>

            {/* Flip Camera Facing Mode */}
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
              aria-label="Flip camera"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/60">
                <RotateCcw className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold">Flip</span>
            </button>
          </div>
        </section>
      ) : (
        /* ── 5. CAMERA PERMISSION / ERROR OR UPLOAD FALLBACK ── */
        <div className="flex flex-col gap-4">
          <ErrorState
            title={
              cameraStatus === "denied"
                ? "Camera permission denied"
                : cameraStatus === "insecure"
                  ? "Secure connection required"
                  : cameraStatus === "unavailable"
                    ? "Camera not detected"
                    : "Starting camera..."
            }
            message={
              cameraStatus === "denied"
                ? "Allow camera permissions in browser settings, or upload a photo directly."
                : cameraStatus === "unavailable"
                  ? "No active camera found. You can still upload a leaf photo from your files."
                  : "Please wait while we connect your device camera."
            }
            actionLabel={cameraStatus === "requesting" ? undefined : "Try Camera Again"}
            onAction={
              cameraStatus === "requesting" ? undefined : () => void startCamera(facingMode)
            }
          />

          {/* Direct File Upload Alternative */}
          <div className="rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Upload Photo from Gallery</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Works instantly without camera permissions
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Choose Photo File
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
