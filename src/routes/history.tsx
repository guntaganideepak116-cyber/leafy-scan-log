import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Camera,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Clock,
  BarChart3,
} from "lucide-react";

import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { usePlantApp } from "@/components/plant-app-provider";
import { readScanHistory, type ScanRecord, SCAN_HISTORY_KEY } from "@/lib/plant-analysis";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan History — Smart Plant AI" },
      {
        name: "description",
        content: "Review your previous plant scans and AI analysis results.",
      },
      { property: "og:title", content: "Scan History — Smart Plant AI" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

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

  const clearHistory = () => {
    if (window.confirm("Clear all scan history? This cannot be undone.")) {
      localStorage.removeItem(SCAN_HISTORY_KEY);
      setRecords([]);
    }
  };

  const totalScans = records.length;
  const diseaseScans = records.filter((r) => {
    const d = r.analysis?.disease;
    return (
      d?.name &&
      !(d as { status?: string }).status?.includes("healthy") &&
      !(d.name as string).toLowerCase().includes("healthy")
    );
  }).length;
  const healthyScans = totalScans - diseaseScans;

  return (
    <main className="flex w-full flex-col gap-4 px-4 pt-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Scan History</h1>
        {records.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <EmptyState
          title="No scans yet"
          message="Your analyzed plants will appear here after your first scan."
        >
          <Button asChild size="lg" className="mt-2 min-h-11 gap-2">
            <Link to="/scanner">
              <Camera className="h-4 w-4" />
              Scan a plant
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total Scans",
                value: totalScans,
                icon: BarChart3,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Diseases Found",
                value: diseaseScans,
                icon: AlertCircle,
                color: "text-red-600",
                bg: "bg-red-50",
              },
              {
                label: "Healthy Plants",
                value: healthyScans,
                icon: CheckCircle2,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
                >
                  <stat.icon className="h-4 w-4" />
                </span>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Timeline List */}
          <ul className="flex flex-col gap-3">
            {records.map((record, index) => {
              const disease = record.analysis?.disease;
              const plant = record.analysis?.plant;
              const score = typeof disease?.score === "number" ? disease.score : null;
              const isHealthy =
                (disease as { status?: string })?.status === "healthy" ||
                (typeof disease?.name === "string" &&
                  disease.name.toLowerCase().includes("healthy"));
              const hasDisease = disease?.name && !isHealthy;

              return (
                <li key={record.id} className="relative">
                  {/* Timeline line */}
                  {index < records.length - 1 && (
                    <div className="absolute left-5 top-14 h-full w-0.5 bg-border" />
                  )}

                  <button
                    type="button"
                    onClick={() => openRecord(record)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {/* Status Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isHealthy
                          ? "bg-emerald-100 text-emerald-600"
                          : hasDisease
                            ? "bg-red-100 text-red-600"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isHealthy ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : hasDisease ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <Camera className="h-5 w-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-card-foreground truncate">
                        {disease?.name ?? "No disease detected"}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {plant?.name ? (
                          <span className="italic truncate">{plant.name as string}</span>
                        ) : null}
                        {plant?.name && score !== null && <span>·</span>}
                        {score !== null ? (
                          <span className="font-medium">{Math.round(score * 100)}% confidence</span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(record.analyzedAt)}
                        <span className="text-muted-foreground/50">·</span>
                        {new Date(record.analyzedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Confidence mini-bar */}
                    {score !== null && (
                      <div className="hidden flex-col items-center gap-1 sm:flex">
                        <div className="h-12 w-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`w-full rounded-full transition-all ${
                              isHealthy ? "bg-emerald-500" : "bg-red-500"
                            }`}
                            style={{ height: `${Math.round(score * 100)}%`, marginTop: "auto" }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {Math.round(score * 100)}%
                        </span>
                      </div>
                    )}

                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="text-center text-xs text-muted-foreground">
            {records.length} scan{records.length !== 1 ? "s" : ""} saved on this device
          </p>
        </>
      )}
    </main>
  );
}
