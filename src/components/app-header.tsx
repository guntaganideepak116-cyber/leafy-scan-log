import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Smart Plant AI home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold text-foreground">Smart Plant AI</span>
        </Link>
        <span className="text-xs font-medium text-muted-foreground">Powered by real AI analysis</span>
      </div>
    </header>
  );
}
