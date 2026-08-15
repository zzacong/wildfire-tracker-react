"use client";

import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { CloudOffIcon, MapPinOffIcon, RefreshCwIcon, SearchXIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { EventRow } from "@/components/shell/events/EventRow";
import { EventSortMenu } from "@/components/shell/events/EventSortMenu";
import { DEFAULT_SORT, sortEvents, type EventSort } from "@/components/shell/events/sort";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapAccessor } from "@/lib/map-accessor";
import { useSelection } from "@/lib/selection";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/index";

const FLY_ZOOM = 6;
const FLY_DURATION = 1000;

const SORT_LABELS: Record<string, string> = {
  "date-desc": "Newest first",
  "date-asc": "Oldest first",
  "area-desc": "Largest area first",
  "area-asc": "Smallest area first",
};

interface EventListPanelProps {
  /** Render without the floating-panel card chrome (used inside the mobile drawer). */
  embedded?: boolean;
  /** Optional close affordance shown in the header (used inside the mobile drawer). */
  onClose?: () => void;
}

export function EventListPanel({ embedded = false, onClose }: EventListPanelProps = {}) {
  const { events, status } = Route.useLoaderData();
  const { selectedEventId, setSelectedEventId } = useSelection();
  const { flyTo } = useMapAccessor();
  const router = useRouter();
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const [sort, setSort] = useState<EventSort>(DEFAULT_SORT);
  const [retrying, setRetrying] = useState(false);

  const sortedEvents = useMemo(() => sortEvents(events ?? [], sort), [events, sort]);

  const hasActiveFilters = Boolean(search.status || search.kind || search.start || search.end);

  async function retry() {
    setRetrying(true);
    try {
      await router.invalidate();
    } finally {
      setRetrying(false);
    }
  }

  const clearFilters = () => navigate({ search: {} });

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
      className={cn(
        "flex h-full flex-col overflow-hidden",
        !embedded && "rounded-2xl border border-border glass shadow-lg shadow-black/30",
      )}
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
          {onClose && (
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close event list">
              <XIcon />
            </Button>
          )}
        </div>
      </header>

      {events === undefined ? (
        <div role="status" aria-busy="true" className="flex min-h-0 flex-1 flex-col gap-4 p-4">
          <span className="sr-only">Loading events</span>
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
      ) : status === "error" && events.length === 0 ? (
        <div
          role="alert"
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-destructive/10 ring-1 ring-destructive/30">
            <CloudOffIcon className="size-4 text-destructive" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="text-sm font-medium text-foreground">Couldn&apos;t load events</p>
          <p className="max-w-[28ch] text-xs leading-relaxed text-muted-foreground">
            The hazard feed is unreachable right now.
          </p>
          <Button variant="outline" size="sm" onClick={retry} disabled={retrying} className="mt-1">
            <RefreshCwIcon
              className={cn(retrying && "animate-spin motion-reduce:animate-none")}
              aria-hidden
            />
            {retrying ? "Retrying…" : "Retry"}
          </Button>
        </div>
      ) : sortedEvents.length === 0 ? (
        <div
          role="status"
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-muted/40 ring-1 ring-border">
            {hasActiveFilters ? (
              <SearchXIcon
                className="size-4 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
            ) : (
              <MapPinOffIcon
                className="size-4 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
            )}
          </div>
          <p className="text-sm font-medium text-foreground">
            {hasActiveFilters ? "No events match your filters" : "No active events right now"}
          </p>
          <p className="max-w-[30ch] text-xs leading-relaxed text-muted-foreground">
            {hasActiveFilters
              ? "Try widening the date range or clearing your filters."
              : "Check back soon — new reports land as they open."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-1">
              Clear filters
            </Button>
          )}
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
