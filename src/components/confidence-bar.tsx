export function ConfidenceBar({ score }: { score: number }) {
  const percent = Math.round(Math.min(Math.max(score, 0), 1) * 100);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">AI confidence</span>
        <span className="font-semibold text-foreground">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`AI confidence ${percent} percent`}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
