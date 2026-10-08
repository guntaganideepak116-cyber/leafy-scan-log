import { Link, useRouterState } from "@tanstack/react-router";
import { History, Home, Info, Scan } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/scanner", label: "Scan", icon: Scan, prominent: true },
  { to: "/history", label: "History", icon: History },
  { to: "/about", label: "About", icon: Info },
] as const;

export function BottomNavigation() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur"
    >
      <div className="mx-auto grid w-full max-w-3xl grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          if ("prominent" in item && item.prominent) {
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label="Scan a plant"
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-center py-1"
              >
                <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className={`mt-1 text-xs font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-xs font-medium ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
