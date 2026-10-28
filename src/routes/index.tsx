import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  Zap,
  ShieldCheck,
  History,
  FileText,
  ArrowRight,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Download,
  Sparkles,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { openInstallPrompt } from "@/components/install-prompt";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Plant AI — Mobile Plant Disease Scanner" },
      {
        name: "description",
        content:
          "Scan your plant leaf and get instant real AI disease detection with confidence scores, treatment remedies, severity assessment, and downloadable PDF reports.",
      },
      { property: "og:title", content: "Smart Plant AI — Real-time Plant Disease Detection" },
      {
        property: "og:description",
        content: "Scan your plant leaf and get instant AI-powered disease detection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const steps = [
  {
    icon: Camera,
    step: "01",
    title: "Snap Leaf",
    text: "Point your camera or upload a clear leaf photo.",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Zap,
    step: "02",
    title: "AI Analysis",
    text: "Sent directly to Pl@ntNet AI botanical engine.",
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Get Remedies",
    text: "Diagnosis, severity rating & organic treatments.",
    bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
];

const features = [
  {
    icon: Zap,
    title: "Live Botanical AI",
    desc: "Real neural inference via Pl@ntNet — absolutely zero fake or mock data.",
    badge: "Core",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    icon: AlertTriangle,
    title: "Severity Rating",
    desc: "Calculates clinical threat: Mild, Moderate, or High severity rating.",
    badge: "Unique",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  {
    icon: FileText,
    title: "PDF Diagnostic Report",
    desc: "Download complete printable treatment sheets for your garden or farm.",
    badge: "Unique",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  {
    icon: History,
    title: "Offline History",
    desc: "All previous scans saved directly on your device with photos & notes.",
    badge: "Offline",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
];

const diseases = [
  { name: "Early Blight", plant: "Tomato", status: "disease" },
  { name: "Powdery Mildew", plant: "Rose", status: "disease" },
  { name: "Healthy Leaf", plant: "Jasmine", status: "healthy" },
  { name: "Leaf Rust", plant: "Wheat", status: "disease" },
  { name: "Bacterial Spot", plant: "Pepper", status: "disease" },
  { name: "Healthy Foliage", plant: "Monstera", status: "healthy" },
];

function HomePage() {
  return (
    <main className="flex w-full flex-col gap-6 px-4 pt-4">
      {/* ── Mobile Hero Banner ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white shadow-xl shadow-emerald-900/20">
        {/* Decorative background glow */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, white 1.5px, transparent 1.5px), radial-gradient(circle at 20% 80%, white 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Top Pill */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-100">
              <Sparkles className="h-3 w-3 text-emerald-200" />
              Real AI Inference
            </span>
            <button
              onClick={openInstallPrompt}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald-100 hover:bg-white/25 transition-colors"
            >
              <Smartphone className="h-3 w-3" />
              <span>Install App</span>
            </button>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white">
              Instant Plant Disease Detection
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-emerald-100/90 font-medium">
              Point your camera at any affected leaf to get instant real diagnosis, confidence
              rating, and organic remedies.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Button
              asChild
              size="lg"
              className="w-full gap-2 rounded-xl bg-white text-emerald-800 font-bold hover:bg-emerald-50 active:scale-98 shadow-md transition-all py-3"
            >
              <Link to="/scanner">
                <Camera className="h-5 w-5 text-emerald-700" />
                <span>Scan Leaf Now</span>
                <ArrowRight className="h-4 w-4 ml-auto text-emerald-600" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full gap-2 rounded-xl border-white/30 bg-white/10 text-white font-semibold hover:bg-white/20 py-3"
            >
              <Link to="/history">
                <History className="h-4 w-4" />
                <span>Past Scans</span>
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-between pt-1 border-t border-white/15 text-[11px] font-medium text-emerald-200">
            <span>✓ 100% Real AI</span>
            <span>✓ No Sign-up</span>
            <span>✓ Offline Ready</span>
          </div>
        </div>
      </section>

      {/* ── Native Quick Metrics Strip ── */}
      <section className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-3 text-center shadow-xs">
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            &lt; 2s
          </span>
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Instant AI</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-3 text-center shadow-xs">
          <span className="text-base font-extrabold text-foreground">500+</span>
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Diseases</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-3 text-center shadow-xs">
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            100%
          </span>
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Free Access</span>
        </div>
      </section>

      {/* ── 3 Steps Visual Flow ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">How it Works</h2>
          <span className="text-xs text-muted-foreground">3 simple steps</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {steps.map((s) => (
            <div
              key={s.step}
              className="flex flex-col items-center text-center gap-2 rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{s.title}</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-1">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Key Features ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">App Features</h2>
          <span className="text-xs text-emerald-600 font-semibold">Real AI Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <f.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-foreground">{f.title}</p>
                  <span className={`rounded-full px-2 py-0.2 text-[9px] font-bold ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Detectable Conditions Chips ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Common Conditions</h2>
          <Link to="/scanner" className="text-xs font-semibold text-emerald-600 flex items-center">
            Scan Yours <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {diseases.map((d) => (
            <div
              key={d.name}
              className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card p-2.5 shadow-xs"
            >
              {d.status === "healthy" ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" />
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{d.name}</p>
                <p className="text-[10px] text-muted-foreground">{d.plant}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Install PWA Banner ── */}
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-foreground">Add to Your Phone Screen</h3>
            <p className="text-[11px] text-muted-foreground">
              Install the PWA app for 1-tap instant camera scans anytime.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openInstallPrompt}
            className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Install
          </Button>
        </div>
      </section>
    </main>
  );
}
