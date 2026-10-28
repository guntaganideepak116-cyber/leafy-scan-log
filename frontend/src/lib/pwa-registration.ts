export function enableOfflineAppShell(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  // Avoid running in nested iframes or specific sandbox previews
  if (window.self !== window.top) return;

  const parameters = new URLSearchParams(window.location.search);
  if (parameters.get("sw") === "off") return;

  // Register service worker to meet PWA criteria
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then((registration) => {
      console.log("[PWA] Service Worker registered successfully with scope:", registration.scope);
    })
    .catch((error: unknown) => {
      console.warn("[PWA] Offline app service worker registration skipped:", error);
    });
}
