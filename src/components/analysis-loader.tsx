import { useEffect, useState } from "react";
import { Sparkles, Cpu, CheckCircle2, ShieldCheck, Leaf } from "lucide-react";

const STAGES = [
  "Scanning leaf contours & color spectra...",
  "Running Pl@ntNet AI neural inference...",
  "Matching against 500+ plant pathology models...",
  "Evaluating severity & organic remedy protocols...",
];

export function AnalysisLoader() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-5 rounded-3xl border border-emerald-500/20 bg-card p-8 text-center shadow-xl animate-in fade-in"
    >
      {/* Animated Radar / Leaf Scanner */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Outer pulsing rings */}
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping opacity-30" />
        <div className="absolute inset-2 rounded-full border border-emerald-500/40 animate-pulse" />

        {/* Core circle */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30">
          <Leaf className="h-8 w-8 animate-bounce" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground flex items-center justify-center gap-1.5">
          <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" />
          Real AI Botanical Analysis
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          Querying live Pl@ntNet AI inference engine
        </p>
      </div>

      {/* Progress Stage Tracker */}
      <div className="w-full max-w-xs space-y-2 pt-2">
        <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 p-3 text-left">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-600 shrink-0 animate-pulse" />
            <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 truncate">
              {STAGES[stageIndex]}
            </p>
          </div>
        </div>

        {/* Mini progress ticks */}
        <div className="grid grid-cols-4 gap-1.5 px-2">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= stageIndex ? "bg-emerald-500" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Live neural network diagnosis • No mock data
      </p>
    </div>
  );
}
