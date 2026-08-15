"use client";

import { ExternalLinkIcon, FlameIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import { BottomSheet } from "@/components/shell/BottomSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Area, EventStatus, HazardEvent, Source } from "@/lib/hazard-event";
import { useSelection } from "@/lib/selection";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/index";

import {
  formatAreaNote,
  formatAreaValue,
  formatDate,
  formatKindLabel,
  hostnameOf,
} from "./detail/format";

export function DetailPanel() {
  const { selectedEventId, clearSelection } = useSelection();
  const loaderData = Route.useLoaderData();
  const isOpen = selectedEventId !== null;

  const event = selectedEventId
    ? loaderData.events.find((candidate) => candidate.id === selectedEventId)
    : undefined;

  const lastEventRef = useRef<HazardEvent | null>(null);
  useEffect(() => {
    if (event) {
      lastEventRef.current = event;
    }
  }, [event]);

  const displayEvent = event ?? lastEventRef.current;

  return (
    <>
      <DesktopDetailPanel isOpen={isOpen} event={displayEvent} onClose={clearSelection} />

      <BottomSheet open={isOpen} onClose={clearSelection} ariaLabel="Hazard event details">
        {displayEvent ? (
          <EventDetail event={displayEvent} onClose={clearSelection} />
        ) : (
          <EmptyDetail onClose={clearSelection} />
        )}
      </BottomSheet>
    </>
  );
}

/**
 * Desktop variant (md and up): floating slide-over pinned to the right edge.
 * Focus management, Escape-to-close and `inert` mirror the original panel.
 */
function DesktopDetailPanel({
  isOpen,
  event,
  onClose,
}: {
  isOpen: boolean;
  event: HazardEvent | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else if (openerRef.current) {
      openerRef.current.focus();
      openerRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <aside
      ref={panelRef}
      data-slot="detail-panel"
      role="dialog"
      aria-label="Hazard event details"
      aria-hidden={!isOpen}
      inert={!isOpen}
      tabIndex={isOpen ? -1 : undefined}
      className={cn(
        "pointer-events-auto absolute top-4 right-4 bottom-4 hidden w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border glass shadow-lg shadow-black/40 transition-transform duration-300 ease-out motion-reduce:transition-none md:flex",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]",
      )}
    >
      {event ? <EventDetail event={event} onClose={onClose} /> : <EmptyDetail onClose={onClose} />}
    </aside>
  );
}

function EventDetail({ event, onClose }: { event: HazardEvent; onClose: () => void }) {
  return (
    <>
      <header className="relative border-b border-border/70 px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close event details"
          className="absolute top-2.5 right-2.5"
        >
          <XIcon />
        </Button>

        <div className="flex items-center gap-2 pr-10">
          <p className="font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {formatKindLabel(event.kind)}
          </p>
          <StatusBadge status={event.status} />
        </div>

        <h2 className="mt-2 line-clamp-2 pr-10 font-heading text-base leading-snug font-semibold tracking-tight text-foreground">
          {event.title}
        </h2>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 p-4">
          <AreaTile area={event.area} />

          <dl className="space-y-2.5">
            <MetaRow label="Start" value={formatDate(event.dates.start)} />
            <MetaRow
              label="Closed"
              value={event.dates.closed ? formatDate(event.dates.closed) : "—"}
              muted={!event.dates.closed}
            />
            <MetaRow label="Event ID" value={event.id} mono />
          </dl>

          <section className="space-y-2">
            <SectionLabel>About this event</SectionLabel>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {event.description ?? "No description provided."}
            </p>
          </section>

          <section className="space-y-2.5">
            <SectionLabel>Sources</SectionLabel>
            <div className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70">
              {event.sources.length > 0 ? (
                event.sources.map((source) => <SourceLink key={source.id} source={source} />)
              ) : (
                <p className="px-3.5 py-3 text-sm text-muted-foreground">
                  No reporting agencies listed.
                </p>
              )}
            </div>
            <Button
              render={<a href={event.link} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
              variant="outline"
              className="w-full"
            >
              <ExternalLinkIcon />
              View on EONET
            </Button>
          </section>
        </div>
      </ScrollArea>
    </>
  );
}

function EmptyDetail({ onClose }: { onClose: () => void }) {
  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          Event details
        </h2>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close event details">
          <XIcon />
        </Button>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 p-4 text-center">
        <p className="text-sm font-medium text-foreground">Event unavailable</p>
        <p className="text-xs text-muted-foreground">
          This event is no longer in the current dataset.
        </p>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

function StatusBadge({ status }: { status: EventStatus }) {
  const open = status === "open";
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5",
        open
          ? "border-primary/30 bg-primary/15 text-primary"
          : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      <span className="relative flex size-1.5" aria-hidden>
        {open && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70 motion-reduce:animate-none" />
        )}
        <span
          className={cn(
            "relative inline-flex size-1.5 rounded-full",
            open ? "bg-primary" : "bg-muted-foreground/60",
          )}
        />
      </span>
      {open ? "Open" : "Closed"}
    </Badge>
  );
}

function AreaTile({ area }: { area: Area | null }) {
  const areaNote = area ? formatAreaNote(area) : null;
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-muted/20 p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
        <FlameIcon className="size-4.5 text-primary" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Area
        </p>
        {area ? (
          <p className="mt-0.5 font-heading text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {formatAreaValue(area)}
            <span className="ml-1.5 text-sm font-medium text-muted-foreground">acres</span>
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-muted-foreground">Not reported</p>
        )}
        {areaNote && <p className="mt-0.5 text-[11px] text-muted-foreground/80">{areaNote}</p>}
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  muted = false,
  mono = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 text-right text-sm",
          muted ? "text-muted-foreground" : "text-foreground",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function SourceLink({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{source.id}</p>
        <p className="truncate text-[11px] text-muted-foreground">{hostnameOf(source.url)}</p>
      </div>
      <ExternalLinkIcon
        className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        aria-hidden
      />
    </a>
  );
}
