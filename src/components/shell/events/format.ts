import type { Area, Kind } from "@/lib/hazard-event";

const KIND_LABELS: Record<Kind, string> = {
  wildfire: "Wildfire",
  flood: "Flood",
  earthquake: "Earthquake",
  volcano: "Volcano",
  severeStorm: "Severe storm",
  seaLakeIce: "Sea ice",
  drought: "Drought",
  landslide: "Landslide",
  snow: "Snow",
  other: "Other",
};

export function kindLabel(kind: Kind): string {
  return KIND_LABELS[kind];
}

export function formatStartDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function formatArea(area: Area | null): string {
  if (!area) return "—";
  return `${area.value.toLocaleString("en-US")} ac`;
}
