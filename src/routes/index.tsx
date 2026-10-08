import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Search, Lightbulb, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/plant-home.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Plant AI — Plant Health Analysis" },
      {
        name: "description",
        content: "Scan your plant with your camera and get real AI-powered disease detection and confidence scores.",
      },
      { property: "og:title", content: "Smart Plant AI — Plant Health Analysis" },
      {
        property: "og:description",
        content: "Scan your plant with your camera and get real AI-powered disease detection and confidence scores.",
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
    title: "Capture",
    text: "Take a clear photo of the affected leaf or plant with your camera.",
  },
  {
    icon: Search,
    title: "Analyze",
    text: "Your photo is sent securely to our AI analysis service for identification.",
  },
  {
    icon: Lightbulb,
    title: "Understand",
    text: "See the detected disease, the AI confidence score, and what it means.",
  },
];

function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pb-28 pt-6">
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <img
          src={heroImage}
          alt="A healthy green plant leaf, ready to be scanned"
          className="h-48 w-full object-cover sm:h-64"
        />
        <div className="flex flex-col gap-4 p-6">
          <h1 className="text-3xl font-semibold leading-tight text-card-foreground">
            Scan your plant
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Point your camera at a leaf, capture a photo, and get a real AI-powered health
            analysis with a confidence score — no guesswork.
          </p>
          <div>
            <Button asChild size="lg" className="min-h-11 gap-2">
              <Link to="/scanner">
                Scan Plant
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Powered by real AI analysis
          </p>
        </div>
      </section>

      <section aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="text-xl font-semibold text-foreground">
          How it works
        </h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-card-foreground">
                {index + 1}. {step.title}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-border bg-muted/40 p-5">
        <h2 className="text-sm font-semibold text-foreground">Works offline too</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          The app opens without a connection, but AI analysis needs the internet — your photo is
          analyzed by the live service, never by a stored guess.
        </p>
      </section>
    </main>
  );
}
