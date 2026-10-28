// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
if (process.env.VERCEL || !process.env.NITRO_PRESET) {
  process.env.NITRO_PRESET = "vercel";
}

import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      strategies: "generateSW",
      filename: "sw.js",
      includeAssets: ["apple-touch-icon.png", "favicon.png"],
      manifest: {
        id: "/",
        name: "Smart Plant AI",
        short_name: "Plant AI",
        description: "AI-powered plant disease detection application",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
        display: "standalone",
        display_override: ["standalone"],
        background_color: "#fbfcf7",
        theme_color: "#216640",
        icons: [
          { src: "/icons/plant-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/plant-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/plant-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/plant-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      devOptions: { enabled: false },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "plant-app-pages",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              url.origin === self.location.origin &&
              request.destination !== "document" &&
              /\/(?:assets|icons)\/.*\.[a-f0-9]{8,}\./i.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "plant-static-assets",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  tanstackStart: {
    prerender: {
      enabled: true,
      crawlLinks: true,
      autoSubfolderIndex: true,
    },
  },
});
