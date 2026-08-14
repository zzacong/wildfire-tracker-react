"use client";

import { useState } from "react";
import { FlameIcon, ListIcon, XIcon } from "lucide-react";

import { MapView } from "@/components/map/MapView";
import { DetailPanel } from "@/components/shell/DetailPanel";
import { EventListPanel } from "@/components/shell/EventListPanel";
import { FilterBar } from "@/components/shell/FilterBar";
import { Button } from "@/components/ui/button";
import { MapAccessorProvider } from "@/lib/map-accessor";
import { SelectionProvider } from "@/lib/selection";

/*
 * Z-index scale (single source of truth for the shell overlay):
 * 0  map
 * 10 overlay root / event list
 * 20 brand, filter bar
 * 40 mobile chrome (events toggle)
 * 50 detail panel
 * 60 mobile event sheet
 */
export function AppShell() {
  return (
    <SelectionProvider>
      <MapAccessorProvider>
        <Shell />
      </MapAccessorProvider>
    </SelectionProvider>
  );
}

function Shell() {
  const [mobileEventsOpen, setMobileEventsOpen] = useState(false);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <header className="pointer-events-auto absolute top-4 left-4 z-20">
          <Brand />
        </header>

        <div className="pointer-events-auto absolute top-4 left-1/2 z-20 hidden -translate-x-1/2 sm:block">
          <FilterBar />
        </div>

        <aside className="pointer-events-auto absolute top-20 bottom-4 left-4 z-10 hidden w-[340px] max-w-[calc(100vw-2rem)] md:block">
          <EventListPanel />
        </aside>

        <div className="pointer-events-auto absolute top-4 right-4 bottom-4 z-50">
          <DetailPanel />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-20 z-40 flex justify-end md:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setMobileEventsOpen((open) => !open)}
          aria-expanded={mobileEventsOpen}
        >
          <ListIcon />
          Events
        </Button>
      </div>

      {mobileEventsOpen && (
        <div className="absolute inset-0 z-60 md:hidden">
          <button
            type="button"
            aria-label="Close event list"
            onClick={() => setMobileEventsOpen(false)}
            className="absolute inset-0 cursor-default bg-black/60"
          />
          <div className="glass absolute inset-x-3 top-16 bottom-3 flex flex-col rounded-2xl border border-border shadow-xl shadow-black/40">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileEventsOpen(false)}
                aria-label="Close event list"
              >
                <XIcon />
              </Button>
            </div>
            <div className="min-h-0 flex-1 px-3 pb-3">
              <EventListPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Brand() {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl border border-border px-3.5 py-2.5 shadow-lg shadow-black/30">
      <div className="grid size-8 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
        <FlameIcon className="size-4 text-primary" strokeWidth={1.75} aria-hidden />
      </div>
      <div>
        <p className="font-heading text-sm font-semibold tracking-tight text-foreground">
          Wildfire Tracker
        </p>
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <span className="relative flex size-1.5" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70 motion-reduce:animate-none" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          LIVE
        </p>
      </div>
    </div>
  );
}
