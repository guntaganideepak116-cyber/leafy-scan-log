import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { ConfidenceBar } from "@/components/confidence-bar";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { usePlantApp } from "@/components/plant-app-provider";
import { hasConfidentDisease } from "@/lib/plant-analysis";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Analysis Result — Smart Plant AI" },
      {
        name: "description",
        content: "See the AI disease analysis result and confidence score for your scanned plant.",
      },
      { property: "og:title", content: "Analysis Result — Smart Plant AI" },
      {
        property: "og:description",
        content: "See the AI disease analysis result and confidence score for your scanned plant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const navigate = useNavigate();
  const { session, historySelection, clearCurrentScan } = usePlantApp();

  const analysis = session.analysis ?? historySelection?.analysis ?? null;
  const imageUrl = session.imageUrl;
  const confident = hasConfidentDisease(analysis);
  const disease = analysis?.disease;
  const plant = analysis?.plant;

  useEffect(() => {
    if (!analysis) void navigate({ to: "/scanner" });
  }, [analysis, navigate]);

  if (!analysis) return null;

  const scanAgain = (
    <Button asChild size="lg" className="min-h-11">
      <Link to="/scanner" onClick={clearCurrentScan}>
        Scan Again
      </Link>
    </Button>
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pb-28 pt-6">
      <h1 className="text-2xl font-semibold text-foreground">Analysis result</h1>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Your scanned plant photo"
          className="max-h-72 w-full rounded-2xl border border-border object-cover"
        />
      ) : null}

      {confident && disease ? (
        <section
          aria-label="Detected disease"
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Detected disease
            </p>
            <h2 className="mt-1 text-xl font-semibold text-card-foreground">{disease.name}</h2>
          </div>

          {typeof disease.score === "number" ? <ConfidenceBar score={disease.score} /> : null}

          {disease.description ? (
            <p className="text-sm leading-6 text-muted-foreground">{disease.description}</p>
          ) : null}

          {plant?.name ? (
            <p className="text-sm text-muted-foreground">
              Plant: <span className="font-medium text-foreground">{plant.name}</span>
              {typeof plant.score === "number" ? ` (${Math.round(plant.score * 100)}% match)` : ""}
            </p>
          ) : null}

          {Array.isArray(disease.images) && disease.images.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto">
              {disease.images
                .filter((image) => typeof image.url === "string")
                .slice(0, 4)
                .map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`Reference photo ${index + 1} of ${disease.name}`}
                    className="h-20 w-20 rounded-lg border border-border object-cover"
                    loading="lazy"
                  />
                ))}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Provider: {analysis.provider ?? "Pl@ntNet"} AI
            {analysis.analyzedAt
              ? ` · Analyzed ${new Date(analysis.analyzedAt).toLocaleString()}`
              : ""}
          </p>
        </section>
      ) : (
        <EmptyState
          title="Unable to confidently identify a disease."
          message="The AI could not match this photo with enough confidence. Try a clearer, closer photo of the affected leaf."
        />
      )}

      <div className="flex flex-col gap-3">{scanAgain}</div>
    </main>
  );
}
