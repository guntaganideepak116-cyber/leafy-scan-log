import { Link } from "@tanstack/react-router";
import { Leaf, Download, Sparkles } from "lucide-react";
import { openInstallPrompt } from "@/components/install-prompt";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="flex h-14 w-full items-center justify-between px-4">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Smart Plant AI home">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-foreground">
                Smart Plant AI
              </span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-none flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Pl@ntNet AI
            </p>
          </div>
        </Link>

        {/* Right Action: Install Button / Modal Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openInstallPrompt}
            className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-all active:scale-95 shadow-sm"
            aria-label="Install App"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Install</span>
          </button>
        </div>
      </div>
    </header>
  );
}
