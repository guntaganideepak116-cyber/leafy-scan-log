import { Link, useRouterState } from "@tanstack/react-router";
import { History, Home, Info, Scan, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { readScanHistory } from "@/lib/plant-analysis";

export function BottomNavigation() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    // Read count on load and listen for storage changes
    const updateCount = () => {
      const records = readScanHistory();
      setScanCount(records.length);
    };
    updateCount();
    window.addEventListener("storage", updateCount);
    // Also periodically check when navigating
    return () => window.removeEventListener("storage", updateCount);
  }, [pathname]);

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/scanner", label: "Scan Leaf", icon: Camera, prominent: true },
    {
      to: "/history",
      label: "History",
      icon: History,
      badge: scanCount > 0 ? scanCount : undefined,
    },
    { to: "/about", label: "About", icon: Info },
  ] as const;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none"
    >
      <div className="w-full max-w-md sm:max-w-lg bg-background/95 backdrop-blur-xl border-t border-border/60 pointer-events-auto pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-4 items-center h-16 px-3">
          {items.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;

            if ("prominent" in item && item.prominent) {
              return (
                <div key={item.to} className="relative flex justify-center items-center">
                  <Link
                    to={item.to}
                    aria-label="Scan a plant leaf"
                    className="group -mt-7 flex flex-col items-center justify-center focus:outline-none"
                  >
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-tr from-emerald-600 via-green-500 to-teal-500 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-background transition-transform duration-200 active:scale-90 group-hover:scale-105">
                      <Icon className="h-6 w-6 stroke-[2.2]" aria-hidden="true" />
                      {/* Subtle pulse ring */}
                      <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-40 pointer-events-none" />
                    </span>
                    <span
                      className={`mt-1 text-[11px] font-semibold tracking-tight transition-colors ${
                        active
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </div>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center h-full py-1 text-[11px] font-medium transition-all active:scale-95 ${
                  active
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
                  {"badge" in item && item.badge ? (
                    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white shadow-xs">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="mt-1 leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
