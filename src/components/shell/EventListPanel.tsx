"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function EventListPanel() {
  return (
    <section
      data-slot="event-list-panel"
      aria-label="Hazard events"
      className="glass flex h-full flex-col overflow-hidden rounded-2xl border border-border shadow-lg shadow-black/30"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div>
          <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Events
          </h2>
          <p className="text-[11px] text-muted-foreground">Active hazard events</p>
        </div>
        <Badge variant="outline" className="font-mono text-[11px]">
          —
        </Badge>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-2 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
