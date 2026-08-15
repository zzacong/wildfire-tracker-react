"use client";

import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { CloudOffIcon, HistoryIcon, RefreshCwIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Slim, dismissible notice shown while serving last-known data after the
 * live feed failed to refresh. Unobtrusive: a pill floating below the filter
 * bar, tinted amber rather than alarm-red.
 */
export function StaleBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      className="glass pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-warning/30 py-1 pr-1 pl-3.5 shadow-lg shadow-black/30"
    >
      <HistoryIcon className="size-3.5 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
      <p className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
        Showing last-known data — live feed unavailable
      </p>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss stale-data notice"
      >
        <XIcon />
      </Button>
    </div>
  );
}

/**
 * Full error state replacing the dead page when a fetch fails with no
 * cached events to fall back on. Offers a retry that re-runs the loader.
 */
export function ErrorOverlay() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    try {
      await router.invalidate();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/40 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-sm rounded-2xl border border-border p-6 text-center shadow-xl shadow-black/40">
        <div className="mx-auto grid size-11 place-items-center rounded-xl bg-destructive/10 ring-1 ring-destructive/30">
          <CloudOffIcon className="size-5 text-destructive" strokeWidth={1.75} aria-hidden />
        </div>
        <h2 className="mt-3 font-heading text-base font-semibold tracking-tight text-foreground">
          Live feed unavailable
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          We couldn&apos;t reach the hazard feed. Check your connection and try again.
        </p>
        <Button onClick={retry} disabled={retrying} className="mt-4 w-full">
          <RefreshCwIcon
            className={cn(retrying && "animate-spin motion-reduce:animate-none")}
            aria-hidden
          />
          {retrying ? "Retrying…" : "Retry"}
        </Button>
      </div>
    </div>
  );
}
