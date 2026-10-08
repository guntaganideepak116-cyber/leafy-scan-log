import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { usePlantApp } from "@/components/plant-app-provider";
import { readScanHistory, type ScanRecord } from "@/lib/plant-analysis";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan History — Smart Plant AI" },
      {
        name: "description",
        content: "Review your previous plant scans and AI analysis results.",
      },
      { property: "og:title", content: "Scan History — Smart Plant AI" },
      {
        property: "og:description",
        content: "Review your previous plant scans and AI analysis results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const { selectHistoryRecord } = usePlantApp();
  const [records, setRecords] = useState<ScanRecord[]>([]);

  useEffect(() => {
    setRecords(readScanHistory());
  }, []);

  const openRecord = (record: ScanRecord) => {
    selectHistoryRecord(record);
    void navigate({ to: "/result" });
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-28 pt-6">
      <h1 className="text-2xl font-semibold text-foreground">Scan history</h1>

      {records.length === 0 ? (
        <EmptyState
          title="No scans yet"
          message="Your analyzed plants will appear here after your first scan."
        >
          <Button asChild className="mt-2 min-h-11">
            <Link to="/scanner">Scan a plant</Link>
          </Button>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {records.map((record) => {
            const disease = record.analysis?.disease;
            const plant = record.analysis?.plant;
            const score = disease?.score;
            return (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => openRecord(record)}
                  className="flex w-full flex-col gap-1 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-sm font-semibold text-card-foreground">
                    {disease?.name ?? "No confident disease detected"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {plant?.name ? `${plant.name} · ` : ""}
                    {new Date(record.analyzedAt).toLocaleString()}
                    {typeof score === "number" ? ` · AI confidence ${Math.round(score * 100)}%` : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
