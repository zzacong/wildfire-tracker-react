"use client";

import { FlameIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface HeatmapToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function HeatmapToggle({ enabled, onToggle }: HeatmapToggleProps) {
  return (
    <div
      data-slot="heatmap-toggle"
      className="glass pointer-events-auto absolute bottom-4 left-4 z-10 inline-flex items-center gap-2.5 rounded-2xl border border-border py-2 pr-3 pl-3.5 shadow-lg shadow-black/30"
    >
      <FlameIcon className="size-3.5 text-primary" strokeWidth={1.75} aria-hidden />
      <span className="text-xs font-medium tracking-tight text-foreground">Heatmap</span>
      <Switch
        size="sm"
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label="Toggle heatmap view"
      />
    </div>
  );
}
