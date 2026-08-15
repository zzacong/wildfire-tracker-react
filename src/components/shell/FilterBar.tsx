"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ActivityIcon,
  CheckIcon,
  ChevronDownIcon,
  CloudLightningIcon,
  FlameIcon,
  MountainIcon,
  MountainSnowIcon,
  ShapesIcon,
  SnowflakeIcon,
  SunIcon,
  TriangleAlertIcon,
  WavesIcon,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import type { Kind } from "@/lib/hazard-event";
import { DEFAULT_HAZARD_KIND, WIRED_KINDS, type HazardFiltersInput } from "@/lib/hazard-filters";
import { cn } from "@/lib/utils";

const KIND_OPTIONS: ReadonlyArray<{ kind: Kind; label: string; icon: LucideIcon }> = [
  { kind: "wildfire", label: "Wildfire", icon: FlameIcon },
  { kind: "flood", label: "Flood", icon: WavesIcon },
  { kind: "earthquake", label: "Earthquake", icon: ActivityIcon },
  { kind: "volcano", label: "Volcano", icon: MountainIcon },
  { kind: "severeStorm", label: "Severe storm", icon: CloudLightningIcon },
  { kind: "seaLakeIce", label: "Sea & lake ice", icon: SnowflakeIcon },
  { kind: "drought", label: "Drought", icon: SunIcon },
  { kind: "landslide", label: "Landslide", icon: TriangleAlertIcon },
  { kind: "snow", label: "Snow", icon: MountainSnowIcon },
  { kind: "other", label: "Other", icon: ShapesIcon },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

function dateRangeLabel(search: HazardFiltersInput): string {
  if (search.start && search.end) {
    return `${formatDate(search.start)} – ${formatDate(search.end)}`;
  }
  if (search.start) {
    return `From ${formatDate(search.start)}`;
  }
  if (search.end) {
    return `Until ${formatDate(search.end)}`;
  }
  return "All time";
}

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

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </label>
  );
}

type FilterControl = "status" | "kind" | "date" | null;

export function FilterBar() {
  const [open, setOpen] = useState<FilterControl>(null);
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  const status = search.status ?? "open";
  const kind = search.kind ?? DEFAULT_HAZARD_KIND;
  const hasDateRange = Boolean(search.start || search.end);

  const setSearch = (patch: Partial<HazardFiltersInput>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  return (
    <div
      data-slot="filter-bar"
      className="inline-flex items-center gap-1 rounded-2xl border border-border glass p-1.5 shadow-lg shadow-black/30"
    >
      <div className="hidden items-center gap-3 px-2 xl:flex">
        <LegendItem label="Open" dotClassName="bg-primary" />
        <LegendItem label="Recently closed" dotClassName="bg-foreground/50" />
      </div>
      <div className="mx-1 hidden h-4 w-px bg-border xl:block" aria-hidden />

      <Popover
        open={open === "status"}
        onOpenChange={(isOpen) => setOpen(isOpen ? "status" : null)}
      >
        <PopoverTrigger
          aria-label="Status filter"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              status === "open" ? "bg-primary" : "bg-foreground/50",
            )}
            aria-hidden
          />
          {status === "open" ? "Open only" : "Open + recently closed"}
          <ChevronDownIcon className="size-3 text-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Status</PopoverTitle>
            <PopoverDescription>
              Open events by default, or also include fires contained within the last 30 days.
            </PopoverDescription>
          </PopoverHeader>
          <label className="flex items-start justify-between gap-4 rounded-lg px-2 py-1.5">
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">Recently closed</span>
              <span className="text-xs leading-snug text-muted-foreground">
                Include events closed within the last 30 days.
              </span>
            </span>
            <Switch
              checked={status === "recently-closed"}
              onCheckedChange={(checked) => {
                setSearch({ status: checked ? "recently-closed" : undefined });
                setOpen(null);
              }}
              aria-label="Include recently closed events"
            />
          </label>
        </PopoverContent>
      </Popover>

      <Popover open={open === "kind"} onOpenChange={(isOpen) => setOpen(isOpen ? "kind" : null)}>
        <PopoverTrigger
          aria-label="Event kind filter"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <FlameIcon className="size-3.5 text-primary" aria-hidden />
          Wildfire
          <ChevronDownIcon className="size-3 text-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <PopoverHeader>
            <PopoverTitle>Event kind</PopoverTitle>
            <PopoverDescription>Only Wildfire is wired right now.</PopoverDescription>
          </PopoverHeader>
          <div role="radiogroup" aria-label="Event kind" className="grid gap-0.5">
            {KIND_OPTIONS.map(({ kind: optionKind, label, icon: Icon }) => {
              const selected = kind === optionKind;
              const disabled = !WIRED_KINDS.includes(optionKind);
              return (
                <button
                  key={optionKind}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  onClick={() => {
                    setSearch({ kind: optionKind });
                    setOpen(null);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    disabled && "cursor-not-allowed text-muted-foreground/60 hover:bg-transparent",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="size-3.5 shrink-0 text-primary/70" aria-hidden />
                    <span className="truncate">{label}</span>
                  </span>
                  {selected ? (
                    <CheckIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
                  ) : (
                    disabled && (
                      <span className="shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground/50 uppercase">
                        Soon
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={open === "date"} onOpenChange={(isOpen) => setOpen(isOpen ? "date" : null)}>
        <PopoverTrigger
          aria-label="Date range filter"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              hasDateRange ? "bg-primary" : "bg-foreground/50",
            )}
            aria-hidden
          />
          {dateRangeLabel(search)}
          <ChevronDownIcon className="size-3 text-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <PopoverHeader>
            <PopoverTitle>Date range</PopoverTitle>
            <PopoverDescription>
              Narrows the EONET query to events that fall within this window.
            </PopoverDescription>
          </PopoverHeader>
          <div className="grid gap-2.5">
            <DateField
              label="From"
              value={search.start ?? ""}
              onChange={(value) => setSearch({ start: value || undefined })}
            />
            <DateField
              label="To"
              value={search.end ?? ""}
              onChange={(value) => setSearch({ end: value || undefined })}
            />
          </div>
          {hasDateRange && (
            <button
              type="button"
              onClick={() => setSearch({ start: undefined, end: undefined })}
              className="flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Clear dates
            </button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
