import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
  RefreshCw,
  History,
  Leaf,
  Droplets,
  FlaskConical,
  ShieldCheck,
  Clock,
  Cpu,
} from "lucide-react";

import { ConfidenceBar } from "@/components/confidence-bar";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { usePlantApp } from "@/components/plant-app-provider";
import { hasConfidentDisease, readScanHistory } from "@/lib/plant-analysis";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Analysis Result — Smart Plant AI" },
      {
        name: "description",
        content:
          "See the AI disease analysis result with confidence score, severity assessment, and treatment recommendations for your scanned plant.",
      },
      { property: "og:title", content: "Analysis Result — Smart Plant AI" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResultPage,
});

function getSeverity(score: number): {
  label: string;
  color: string;
  bg: string;
  bar: string;
  desc: string;
} {
  if (score >= 0.75)
    return {
      label: "High Confidence",
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
      bar: "bg-red-500",
      desc: "Strong AI match. The detected condition is very likely present.",
    };
  if (score >= 0.5)
    return {
      label: "Moderate Confidence",
      color: "text-orange-700",
      bg: "bg-orange-50 border-orange-200",
      bar: "bg-orange-500",
      desc: "Reasonable match. Consider taking a clearer photo to confirm.",
    };
  return {
    label: "Low Confidence",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    bar: "bg-yellow-500",
    desc: "Uncertain match. Try a clearer, closer photo of the affected area.",
  };
}

function handlePdfDownload(
  diseaseName: string,
  plantName: string | undefined,
  score: number,
  description: string | undefined,
  treatment: { organic?: string; cultural?: string; chemical?: string } | undefined,
  imageUrl: string | undefined,
  analyzedAt: string | undefined,
) {
  const date = analyzedAt ? new Date(analyzedAt).toLocaleString() : new Date().toLocaleString();
  const pct = Math.round(score * 100);
  const sev = getSeverity(score);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Smart Plant AI — Scan Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 32px; max-width: 720px; margin: auto; }
    .header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; color: #16a34a; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .disease { background: #fee2e2; color: #b91c1c; }
    .healthy { background: #dcfce7; color: #15803d; }
    .section { margin-bottom: 20px; }
    .section h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; margin-bottom: 8px; }
    .disease-name { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .meta { font-size: 13px; color: #6b7280; }
    .confidence-bar { height: 10px; border-radius: 5px; background: #e5e7eb; margin: 8px 0; overflow: hidden; }
    .confidence-fill { height: 100%; border-radius: 5px; background: #16a34a; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
    .info-box h3 { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px; }
    .info-box p { font-size: 13px; color: #6b7280; line-height: 1.5; }
    .severity { padding: 12px 16px; border-radius: 8px; border: 1px solid; margin-bottom: 12px; }
    img.scan-photo { width: 100%; max-height: 260px; object-fit: cover; border-radius: 10px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
    .footer { border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>🌿 Smart Plant AI — Scan Report</h1>
      <p style="font-size:12px;color:#6b7280;">Generated: ${date}</p>
    </div>
  </div>

  ${imageUrl ? `<img class="scan-photo" src="${imageUrl}" alt="Scanned plant photo" />` : ""}

  <div class="section">
    <h2>Detected Condition</h2>
    <div class="disease-name">${diseaseName}</div>
    ${plantName ? `<p class="meta">Plant Species: ${plantName}</p>` : ""}
    <span class="badge ${diseaseName.toLowerCase().includes("healthy") ? "healthy" : "disease"}">
      ${diseaseName.toLowerCase().includes("healthy") ? "✓ Healthy Foliage" : "⚠ Disease Detected"}
    </span>
  </div>

  <div class="section">
    <h2>AI Confidence</h2>
    <p style="font-size:20px;font-weight:700;">${pct}%</p>
    <div class="confidence-bar"><div class="confidence-fill" style="width:${pct}%"></div></div>
    <div class="severity" style="background:${score >= 0.75 ? "#fef2f2" : score >= 0.5 ? "#fff7ed" : "#fefce8"};border-color:${score >= 0.75 ? "#fecaca" : score >= 0.5 ? "#fed7aa" : "#fde68a"}">
      <strong>${sev.label}</strong> — ${sev.desc}
    </div>
  </div>

  ${description ? `<div class="section"><h2>Description</h2><p style="line-height:1.7;color:#374151;">${description}</p></div>` : ""}

  ${
    treatment && (treatment.organic || treatment.cultural || treatment.chemical)
      ? `<div class="section">
      <h2>Treatment Recommendations</h2>
      <div class="info-grid">
        ${treatment.organic ? `<div class="info-box"><h3>🌿 Organic</h3><p>${treatment.organic}</p></div>` : ""}
        ${treatment.cultural ? `<div class="info-box"><h3>🌱 Cultural</h3><p>${treatment.cultural}</p></div>` : ""}
        ${treatment.chemical ? `<div class="info-box"><h3>🧪 Chemical</h3><p>${treatment.chemical}</p></div>` : ""}
      </div>
    </div>`
      : ""
  }

  <div class="footer">
    <p>Generated by Smart Plant AI · Powered by Pl@ntNet Botanical AI API · For guidance only — consult an agricultural expert for severe infestations.</p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PlantScan_${diseaseName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function ResultPage() {
  const { session, clearCurrentScan } = usePlantApp();

  const fallbackRecord = typeof window !== "undefined" ? (readScanHistory()[0] ?? null) : null;
  const activeRecord = session.record ?? fallbackRecord;
  const analysis = session.analysis ?? activeRecord?.analysis ?? null;
  const imageUrl = session.imageUrl;
  const confident = hasConfidentDisease(analysis);
  const disease = analysis?.disease;
  const plant = analysis?.plant;

  const isHealthy =
    disease?.["status"] === "healthy" ||
    (typeof disease?.name === "string" && disease.name.toLowerCase().includes("healthy"));

  const treatment = disease?.["treatment"] as
    { organic?: string; cultural?: string; chemical?: string } | undefined;

  const score = typeof disease?.score === "number" ? disease.score : 0;
  const severity = getSeverity(score);

  if (!analysis) {
    return (
      <main className="flex w-full flex-col gap-4 px-4 pt-3">
        <h1 className="text-xl font-bold text-foreground">Analysis Result</h1>
        <EmptyState
          title="No active scan"
          message="Scan a plant leaf to see the AI analysis result here."
        >
          <Button asChild size="lg" className="mt-2 min-h-11">
            <Link to="/scanner">Scan a Plant</Link>
          </Button>
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col gap-4 px-4 pt-3">
      <h1 className="text-xl font-bold text-foreground">Analysis Result</h1>

      {/* Photo */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Your scanned plant photo"
          className="max-h-72 w-full rounded-2xl border border-border object-cover shadow-sm"
        />
      ) : null}

      {confident && disease ? (
        <>
          {/* Main Result Card */}
          <section
            aria-label="Plant health analysis"
            className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {isHealthy ? "Plant Health Status" : "Detected Condition"}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-card-foreground">{disease.name}</h2>
                {plant?.name ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Species:{" "}
                    <span className="font-medium text-foreground italic">{plant.name}</span>
                    {typeof plant.score === "number"
                      ? ` · ${Math.round((plant.score as number) * 100)}% match`
                      : ""}
                  </p>
                ) : null}
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                  isHealthy
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-red-200 bg-red-50 text-red-700"
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
                    Disease Alert
                  </>
                )}
              </span>
            </div>

            {/* Confidence Bar */}
            {typeof disease.score === "number" ? (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Confidence
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {Math.round(score * 100)}%
                  </span>
                </div>
                <ConfidenceBar score={disease.score} />
              </div>
            ) : null}

            {/* Severity Meter (NEW UNIQUE FEATURE) */}
            {!isHealthy && typeof disease.score === "number" ? (
              <div className={`flex items-start gap-3 rounded-xl border p-4 ${severity.bg}`}>
                <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${severity.color}`} />
                <div>
                  <p className={`text-sm font-bold ${severity.color}`}>{severity.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{severity.desc}</p>
                  <div className="mt-2 flex gap-1">
                    {["Low", "Moderate", "High"].map((lvl, i) => {
                      const active =
                        (i === 0 && score < 0.5) ||
                        (i === 1 && score >= 0.5 && score < 0.75) ||
                        (i === 2 && score >= 0.75);
                      return (
                        <div key={lvl} className="flex flex-col items-center gap-1">
                          <div
                            className={`h-2 w-16 rounded-full ${
                              active ? severity.bar : "bg-gray-200"
                            }`}
                          />
                          <span className="text-xs text-muted-foreground">{lvl}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Description */}
            {disease.description ? (
              <p className="text-sm leading-7 text-muted-foreground">
                {disease.description as string}
              </p>
            ) : null}

            {/* Reference Images from Pl@ntNet */}
            {Array.isArray(disease.images) && disease.images.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reference Photos (from Pl@ntNet)
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {(disease.images as Array<{ url?: string }>)
                    .filter((img) => typeof img.url === "string")
                    .slice(0, 4)
                    .map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt={`Reference ${i + 1} for ${disease.name}`}
                        className="h-20 w-20 shrink-0 rounded-xl border border-border object-cover shadow-sm"
                        loading="lazy"
                      />
                    ))}
                </div>
              </div>
            ) : null}

            {/* Meta */}
            <div className="flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5" />
                {analysis.provider ?? "Pl@ntNet"} AI
              </span>
              {analysis.analyzedAt ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(analysis.analyzedAt as string).toLocaleString()}
                </span>
              ) : null}
            </div>
          </section>

          {/* Treatment Knowledge Card (from Firestore database) */}
          {treatment && (treatment.organic || treatment.cultural || treatment.chemical) ? (
            <section
              aria-label="Treatment recommendations"
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
                <h2 className="font-bold text-card-foreground">
                  {isHealthy ? "Plant Care Guidance" : "Treatment Recommendations"}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {treatment.organic ? (
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Leaf className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">
                        {isHealthy ? "Maintenance" : "Organic Treatment"}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-emerald-800">{treatment.organic}</p>
                  </div>
                ) : null}
                {treatment.cultural ? (
                  <div className="rounded-xl bg-blue-50 p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Droplets className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">Cultural Advice</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-blue-800">{treatment.cultural}</p>
                  </div>
                ) : null}
                {treatment.chemical ? (
                  <div className="rounded-xl bg-orange-50 p-4 sm:col-span-2">
                    <div className="flex items-center gap-2 text-orange-700">
                      <FlaskConical className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">
                        Chemical Treatment
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-orange-800">{treatment.chemical}</p>
                  </div>
                ) : null}
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-5 text-muted-foreground">
                  AI analysis is a guide. For serious infestations, consult a local agricultural
                  expert before applying treatments.
                </p>
              </div>
            </section>
          ) : null}

          {/* PDF Download (NEW UNIQUE FEATURE) */}
          <section className="rounded-2xl border border-border bg-linear-to-br from-emerald-50 to-teal-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">Download Scan Report</p>
                <p className="mt-0.5 text-sm text-emerald-700">
                  Export a complete report with photo, diagnosis, severity, and treatment plan.
                </p>
              </div>
            </div>
            <Button
              id="download-report-btn"
              size="sm"
              className="mt-4 w-full gap-2 bg-emerald-700 text-white hover:bg-emerald-800"
              onClick={() =>
                handlePdfDownload(
                  disease.name as string,
                  plant?.name as string | undefined,
                  score,
                  disease.description as string | undefined,
                  treatment,
                  imageUrl ?? undefined,
                  analysis.analyzedAt as string | undefined,
                )
              }
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </section>
        </>
      ) : (
        <EmptyState
          title="Unable to confidently identify a disease."
          message="The AI could not match this photo with enough confidence. Try a clearer, closer photo of the affected leaf."
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="min-h-11 gap-2">
          <Link to="/scanner" onClick={clearCurrentScan}>
            <RefreshCw className="h-4 w-4" />
            Scan Another Plant
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="min-h-11 gap-2">
          <Link to="/history">
            <History className="h-4 w-4" />
            View in Scan History
          </Link>
        </Button>
      </div>
    </main>
  );
}
