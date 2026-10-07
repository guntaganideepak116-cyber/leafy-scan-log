export function enableOfflineAppShell(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const hostname = window.location.hostname;
  const parameters = new URLSearchParams(window.location.search);
  const isLovablePreview =
    /^(id-preview--|preview--)/.test(hostname) ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev");
  const shouldSkipRegistration =
    !import.meta.env.PROD ||
    window.self !== window.top ||
    isLovablePreview ||
    parameters.get("sw") === "off";

  if (shouldSkipRegistration) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      const appWorkerUrl = new URL("sw.js", window.location.origin).href;
      for (const registration of registrations) {
        const activeWorker = registration.active;
        if (activeWorker && new URL(activeWorker.scriptURL).href === appWorkerUrl) {
          void registration.unregister();
        }
      }
    });
    return;
  }

  void navigator.serviceWorker
    .register("/sw.js")
    .catch((error: unknown) => console.error("Offline app installation is unavailable.", error));
}