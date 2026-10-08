import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Camera, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Smart Plant AI" },
      {
        name: "description",
        content: "Learn how Smart Plant AI uses real AI analysis to detect plant diseases from your photos.",
      },
      { property: "og:title", content: "About — Smart Plant AI" },
      {
        property: "og:description",
        content: "Learn how Smart Plant AI uses real AI analysis to detect plant diseases from your photos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

const points = [
  {
    icon: Camera,
    title: "Your camera, your photos",
    text: "Photos are captured on your device and sent only to the analysis service when you choose.",
  },
  {
    icon: Sparkles,
    title: "Real AI analysis",
    text: "Every result comes from the live Pl@ntNet AI service — never from stored or invented data.",
  },
  {
    icon: ShieldCheck,
    title: "No accounts, no tracking",
    text: "No sign-up or login. Your scan history stays on your own device.",
  },
];

function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-28 pt-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-foreground">About Smart Plant AI</h1>
        <p className="text-base leading-7 text-muted-foreground">
          Smart Plant AI helps you understand plant health. Capture a photo of an affected leaf
          and the app sends it to a real AI analysis service, which returns the most likely
          disease together with a confidence score.
        </p>
      </section>

      <section aria-label="Key principles" className="grid gap-4 sm:grid-cols-3">
        {points.map((point) => (
          <div key={point.title} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <point.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-card-foreground">{point.title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{point.text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-muted/40 p-5">
        <h2 className="text-sm font-semibold text-foreground">A note on accuracy</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          AI analysis is a guide, not a guarantee. When the confidence score is low, the app will
          say so instead of forcing a diagnosis. For serious infestations, consult a local
          agricultural expert.
        </p>
      </section>

      <Button asChild size="lg" className="min-h-11 self-start">
        <Link to="/scanner">Scan a plant</Link>
      </Button>
    </main>
  );
}
