import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "smart-plant-ai-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(DISMISSED_KEY) === "yes") return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!visible || !deferredPrompt) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "yes");
    setVisible(false);
  };

  const install = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Install Smart Plant AI"
      className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-xl border border-border bg-card p-4 shadow-xl"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Download className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-card-foreground">Install Smart Plant AI</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add the app to your home screen for faster access.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={install}>
              Install
            </Button>
            <Button size="sm" variant="outline" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
