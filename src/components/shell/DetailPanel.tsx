"use client";

import { XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelection } from "@/lib/selection";
import { cn } from "@/lib/utils";

export function DetailPanel() {
  const { selectedEventId, clearSelection } = useSelection();
  const isOpen = selectedEventId !== null;

  return (
    <aside
      data-slot="detail-panel"
      role="dialog"
      aria-label="Hazard event details"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "glass pointer-events-auto flex h-full w-[min(340px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border shadow-lg shadow-black/40 transition-transform duration-300 ease-out motion-reduce:transition-none",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]",
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          Event details
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={clearSelection}
          aria-label="Close event details"
        >
          <XIcon />
        </Button>
      </header>

      {isOpen ? (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">ID</span>
            <Badge variant="outline" className="font-mono text-[11px]">
              {selectedEventId}
            </Badge>
          </div>

          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}
    </aside>
  );
}
