import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Plant AI — Plant Health Analysis" },
      {
        name: "description",
        content: "Analyze plant health with real AI-powered disease detection.",
      },
      { property: "og:title", content: "Smart Plant AI — Plant Health Analysis" },
      {
        property: "og:description",
        content: "Analyze plant health with real AI-powered disease detection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Smart Plant AI</p>
      <h1 className="text-4xl font-semibold text-foreground">Plant health analysis</h1>
      <p className="max-w-xl text-base leading-7 text-muted-foreground">
        Real AI-powered plant disease analysis will be available when the scanner and analysis
        service are connected.
      </p>
    </main>
  );
}