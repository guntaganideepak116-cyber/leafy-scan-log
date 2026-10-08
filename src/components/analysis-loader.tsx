import { Loader2 } from "lucide-react";

export function AnalysisLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
      <p className="text-base font-semibold text-card-foreground">Analyzing your plant...</p>
      <p className="text-sm text-muted-foreground">
        Your photo is being checked by the AI analysis service. This can take a few seconds.
      </p>
    </div>
  );
}
