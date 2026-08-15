"use client";

import type { HazardEvent } from "@/lib/hazard-event";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { formatArea, formatStartDate, kindLabel } from "./format";

interface EventRowProps {
  event: HazardEvent;
  selected: boolean;
  onSelect: () => void;
}

export function EventRow({ event, selected, onSelect }: EventRowProps) {
  const isOpen = event.status === "open";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group flex w-full items-start gap-2.5 px-3 py-2.5 text-left outline-none transition-colors motion-reduce:transition-none md:py-2.5",
        "active:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60",
        selected ? "bg-accent/30 ring-1 ring-inset ring-primary/30" : "hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "mt-1.5 size-1.5 shrink-0 rounded-full",
          isOpen ? "bg-primary" : "bg-foreground/50",
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="sr-only">{isOpen ? "Open" : "Closed"}</span>
        <span className="line-clamp-2 block text-[13px] leading-snug font-medium text-foreground">
          {event.title}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted-foreground">
          <Badge
            variant="outline"
            className="h-4 px-1.5 text-[10px] font-medium uppercase tracking-wider"
          >
            {kindLabel(event.kind)}
          </Badge>
          <span className="size-0.5 rounded-full bg-foreground/25" aria-hidden />
          <span className="font-mono">{formatStartDate(event.dates.start)}</span>
          <span className="size-0.5 rounded-full bg-foreground/25" aria-hidden />
          <span className="font-mono">{formatArea(event.area)}</span>
        </span>
      </span>
    </button>
  );
}
