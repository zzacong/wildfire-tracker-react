"use client";

import { useMemo, useState } from "react";

import { EventRow } from "@/components/shell/events/EventRow";
import { EventSortMenu } from "@/components/shell/events/EventSortMenu";
import { DEFAULT_SORT, sortEvents, type EventSort } from "@/components/shell/events/sort";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapAccessor } from "@/lib/map-accessor";
import { Route } from "@/routes/index";
import { useSelection } from "@/lib/selection";

const FLY_ZOOM = 6;
const FLY_DURATION = 1000;

const SORT_LABELS: Record<string, string> = {
  "date-desc": "Newest first",
  "date-asc": "Oldest first",
  "area-desc": "Largest area first",
  "area-asc": "Smallest area first",
};

export function EventListPanel() {
  const { events } = Route.useLoaderData();
  const { selectedEventId, setSelectedEventId } = useSelection();
  const { flyTo } = useMapAccessor();
  const [sort, setSort] = useState<EventSort>(DEFAULT_SORT);

  const sortedEvents = useMemo(() => sortEvents(events ?? [], sort), [events, sort]);

  function handleSelect(id: string, lon: number, lat: number) {
    setSelectedEventId(id);
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = typeof window !== "undefined" && window.innerWidth < 768;
    flyTo(lon, lat, {
      zoom: FLY_ZOOM,
      duration: prefersReducedMotion ? 0 : FLY_DURATION,
      padding: narrow
        ? { top: 24, bottom: 96, left: 0, right: 0 }
        : { top: 48, bottom: 48, left: 380, right: 380 },
    });
  }

  const subtitle = SORT_LABELS[`${sort.key}-${sort.direction}`];

  return (
    <section
      data-slot="event-list-panel"
      aria-label="Hazard events"
      className="glass flex h-full flex-col overflow-hidden rounded-2xl border border-border shadow-lg shadow-black/30"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div className="min-w-0">
          <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Events
          </h2>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant="outline" className="font-mono text-[11px]">
            {events?.length ?? 0}
          </Badge>
          <EventSortMenu sort={sort} onSortChange={setSort} />
        </div>
      </header>

      {events === undefined ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4" aria-hidden>
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
      ) : sortedEvents.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-4">
          <p className="text-xs text-muted-foreground">No events to show.</p>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="divide-y divide-border/40 py-1">
            {sortedEvents.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                selected={event.id === selectedEventId}
                onSelect={() => handleSelect(event.id, event.geometry.lon, event.geometry.lat)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </section>
  );
}
