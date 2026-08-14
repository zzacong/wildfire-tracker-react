"use client";

import { SlidersHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function LegendDot({ className }: { className?: string }) {
  return <span className={cn("size-2 shrink-0 rounded-full", className)} aria-hidden />;
}

function LegendItem({ label, dotClassName }: { label: string; dotClassName: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <LegendDot className={dotClassName} />
      {label}
    </span>
  );
}

export function FilterBar() {
  return (
    <div
      data-slot="filter-bar"
      className="glass inline-flex items-center gap-3 rounded-2xl border border-border px-4 py-2 shadow-lg shadow-black/30"
    >
      <LegendItem label="Open" dotClassName="bg-primary" />
      <LegendItem label="Recently closed" dotClassName="bg-foreground/50" />
      <div className="mx-1 h-4 w-px bg-border" aria-hidden />
      <div data-slot="filter-controls">
        <Button variant="outline" size="sm" disabled>
          <SlidersHorizontalIcon />
          Filters
        </Button>
      </div>
    </div>
  );
}
