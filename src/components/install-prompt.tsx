import { useEffect, useState } from "react";
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Smartphone,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "smart-plant-ai-install-prompt-dismissed-time";
// Allow reprompting after 24 hours if dismissed, or if explicitly requested
const REPROMPT_AFTER_HOURS = 24;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Global trigger to allow header / hero buttons to open install prompt anytime
// eslint-disable-next-line react-refresh/only-export-components
export function openInstallPrompt() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-plant-install-prompt"));
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone (installed PWA) mode
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 3. Listen for native beforeinstallprompt (Android, Chrome, Edge)
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // 4. Listen for appinstalled
    const onAppInstalled = () => {
      setInstalledSuccessfully(true);
      setDeferredPrompt(null);
      setTimeout(() => setVisible(false), 2500);
    };
    window.addEventListener("appinstalled", onAppInstalled);

    // 5. Custom event for manual triggers from header / hero
    const onManualOpen = () => {
      setShowIOSGuide(false);
      setVisible(true);
    };
    window.addEventListener("open-plant-install-prompt", onManualOpen);

    // 6. Automatic display on visiting website
    const lastDismissed = window.localStorage.getItem(DISMISSED_KEY);
    const shouldShow =
      !lastDismissed ||
      Date.now() - parseInt(lastDismissed, 10) > REPROMPT_AFTER_HOURS * 60 * 60 * 1000;

    const timer = setTimeout(() => {
      if (shouldShow && !standaloneMode) {
        setVisible(true);
      }
    }, 900);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("open-plant-install-prompt", onManualOpen);
      clearTimeout(timer);
    };
  }, []);

  if (isStandalone || !visible) return null;

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setVisible(false);
    setShowIOSGuide(false);
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalledSuccessfully(true);
          setTimeout(() => setVisible(false), 2000);
        } else {
          handleDismiss();
        }
      } catch (err) {
        console.warn("Install prompt error:", err);
      }
    } else {
      // In dev mode or desktop where beforeinstallprompt hasn't fired yet
      setShowIOSGuide(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Install Smart Plant AI App"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={handleDismiss} />

      {/* Main Bottom Sheet / Modal */}
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-emerald-500/20 bg-card p-6 shadow-2xl transition-all duration-300">
        {/* Top grab handle on mobile */}
        <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-muted sm:hidden" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {installedSuccessfully ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10 animate-in zoom-in" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Installed Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              Smart Plant AI is now ready on your home screen.
            </p>
          </div>
        ) : showIOSGuide ? (
          /* iOS Safari / Fallback Walkthrough */
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Add to Home Screen</h3>
                <p className="text-xs text-muted-foreground">Easy 3-step setup</p>
              </div>
            </div>

            <div className="space-y-3 py-1">
              <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                  1
                </div>
                <div className="text-xs text-foreground">
                  Tap the <strong className="text-emerald-700 font-semibold">Share</strong> button{" "}
                  <Share2 className="inline h-3.5 w-3.5 mx-1 text-emerald-600" /> at the bottom of
                  Safari
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                  2
                </div>
                <div className="text-xs text-foreground">
                  Scroll down and tap{" "}
                  <strong className="text-emerald-700 font-semibold">Add to Home Screen</strong>{" "}
                  <PlusSquare className="inline h-3.5 w-3.5 mx-1 text-emerald-600" />
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                  3
                </div>
                <div className="text-xs text-foreground">
                  Tap <strong className="text-emerald-700 font-semibold">Add</strong> in the
                  top-right corner. Done!
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl"
              onClick={handleDismiss}
            >
              Got It
            </Button>
          </div>
        ) : (
          /* Default Native App Install Modal */
          <div className="space-y-5">
            {/* Header info with App Icon & Star Rating */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src="/icons/plant-192.png"
                  alt="Smart Plant AI icon"
                  className="h-16 w-16 rounded-2xl border-2 border-emerald-500/30 object-cover shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                  <span>4.9 • Official Mobile App</span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-foreground">Install Smart Plant AI</h3>
                <p className="text-xs text-muted-foreground">
                  Native app experience for faster leaf scans
                </p>
              </div>
            </div>

            {/* Feature Perks */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 p-2.5">
                <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-emerald-950 dark:text-emerald-200">
                  Instant AI Diagnosis
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 p-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-emerald-950 dark:text-emerald-200">
                  100% Free • No Login
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                size="lg"
                onClick={handleInstallClick}
                className="w-full gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 shadow-lg shadow-emerald-600/20 active:scale-98 transition-transform"
              >
                <Download className="h-4 w-4" />
                {isIOS ? "Add to Home Screen" : "Install App (1-Tap)"}
              </Button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2 text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
