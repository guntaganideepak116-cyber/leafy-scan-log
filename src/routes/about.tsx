import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Camera,
  Sparkles,
  Smartphone,
  Download,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { openInstallPrompt } from "@/components/install-prompt";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Smart Plant AI — Real-time Plant Disease Detection" },
      {
        name: "description",
        content:
          "Learn how Smart Plant AI uses real Pl@ntNet AI botanical inference to detect plant diseases from your phone photos.",
      },
      { property: "og:title", content: "About — Smart Plant AI" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

const points = [
  {
    icon: Camera,
    title: "Native Camera & Gallery",
    text: "Snap a live leaf in the viewfinder or upload any high-res photo from your phone.",
  },
  {
    icon: Sparkles,
    title: "100% Real Pl@ntNet AI",
    text: "Every single result is computed live by the Pl@ntNet neural network — zero mock data.",
  },
  {
    icon: ShieldCheck,
    title: "Private & No Accounts",
    text: "Zero sign-up required. Your scan history is stored securely on your own device.",
  },
];

function AboutPage() {
  return (
    <main className="flex w-full flex-col gap-5 px-4 pt-3">
      {/* App Header Card */}
      <section className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm">
            AI
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground">Smart Plant AI</h1>
            <p className="text-xs text-muted-foreground">Version 2.0 • Progressive Web App</p>
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Smart Plant AI is designed as a native mobile assistant for farmers, gardeners, and
          botanists. It connects directly to live botanical neural networks to identify plant
          diseases, evaluate threat severity, and suggest organic and cultural remedies.
        </p>
      </section>

      {/* PWA Install Card */}
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-foreground">Install Mobile App</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add Smart Plant AI to your home screen for full native performance and offline access.
            </p>
            <Button
              size="sm"
              onClick={openInstallPrompt}
              className="mt-3 gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Install on Device
            </Button>
          </div>
        </div>
      </section>

      {/* Key Architectural Principles */}
      <section aria-label="Key principles" className="flex flex-col gap-2.5">
        <h2 className="text-sm font-bold text-foreground">Why It's Different</h2>
        <div className="flex flex-col gap-2">
          {points.map((point) => (
            <div
              key={point.title}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <point.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">{point.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {point.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
            System Architecture
          </h2>
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <strong className="text-foreground">Frontend:</strong> React + TanStack Router (PWA)
          </p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <strong className="text-foreground">Backend API:</strong> Node.js Fastify/Express
            Service
          </p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <strong className="text-foreground">AI Engine:</strong> Pl@ntNet Live Botanical API
          </p>
        </div>
      </section>

      {/* Note on Accuracy */}
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="text-xs font-bold text-foreground">Clinical Diagnostic Note</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          AI confidence scores reflect statistical likelihood based on reference botanical datasets.
          When confidence is below threshold, the system flags the result rather than guessing. For
          major commercial crops, verify with local agricultural extension officers.
        </p>
      </section>
    </main>
  );
}
