"use client";

import { useEffect, useState } from "react";
import { FlameIcon, ListIcon } from "lucide-react";

import { MapView } from "@/components/map/MapView";
import { BottomSheet } from "@/components/shell/BottomSheet";
import { ErrorOverlay, StaleBanner } from "@/components/shell/DataStatus";
import { DetailPanel } from "@/components/shell/DetailPanel";
import { EventListPanel } from "@/components/shell/EventListPanel";
import { FilterBar } from "@/components/shell/FilterBar";
import { Button } from "@/components/ui/button";
import { MapAccessorProvider } from "@/lib/map-accessor";
import { SelectionProvider, useSelection } from "@/lib/selection";
import { Route } from "@/routes/index";

/*
 * Z-index scale (single source of truth for the shell overlay):
 * 0  map
 * 10 overlay root / event list
 * 20 brand, filter bar
 * 30 stale banner, error overlay
 * 40 mobile chrome (events toggle)
 * 50 detail panel (desktop)
 * 60 mobile backdrop (events sheet, detail sheet)
 * 70 mobile bottom sheet (detail, events)
 *
 * Layout: md (768px) and up uses floating panels; below that the detail panel
 * becomes a bottom sheet and the event list lives in a bottom drawer.
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
  const { selectedEventId } = useSelection();
  const loaderData = Route.useLoaderData();
  const events = loaderData?.events ?? [];
  const isStale = loaderData?.isStale ?? false;
  const status = loaderData?.status;

  useEffect(() => {
    if (selectedEventId !== null) {
      setMobileEventsOpen(false);
    }
  }, [selectedEventId]);

  const showError = status === "error" && events.length === 0;
  const showStaleBanner = isStale && events.length > 0;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <header className="pointer-events-auto absolute top-4 left-4 z-20">
          <Brand />
        </header>

        <div className="pointer-events-auto absolute top-4 left-1/2 z-20 hidden -translate-x-1/2 md:block">
          <FilterBar />
        </div>

        <div className="pointer-events-auto absolute inset-x-3 top-16 z-20 flex justify-center md:hidden">
          <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
            <FilterBar />
          </div>
        </div>

        <aside className="pointer-events-auto absolute top-20 bottom-4 left-4 z-10 hidden w-[340px] max-w-[calc(100vw-2rem)] md:block">
          <EventListPanel />
        </aside>

        {showStaleBanner && (
          <div className="pointer-events-none absolute inset-x-0 top-28 z-30 flex justify-center px-4 md:top-16">
            <StaleBanner />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 z-50">
          <DetailPanel />
        </div>
      </div>

      {showError && <ErrorOverlay />}

      <div className="pointer-events-none absolute inset-x-4 bottom-20 z-40 flex justify-end md:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setMobileEventsOpen((open) => !open)}
          aria-expanded={mobileEventsOpen}
          className="pointer-events-auto gap-1.5"
        >
          <ListIcon />
          Events
        </Button>
      </div>

      <BottomSheet
        open={mobileEventsOpen}
        onClose={() => setMobileEventsOpen(false)}
        ariaLabel="Hazard events"
      >
        <div className="min-h-0 flex-1 px-3 pb-4">
          <EventListPanel embedded onClose={() => setMobileEventsOpen(false)} />
        </div>
      </BottomSheet>
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
