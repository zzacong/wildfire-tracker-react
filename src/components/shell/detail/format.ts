import type { Area, Kind } from "@/lib/hazard-event";

const areaFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const smallAreaFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatAreaValue(area: Area): string {
  const formatter = area.value >= 100 ? areaFormatter : smallAreaFormatter;
  return formatter.format(area.value);
}

export function formatAreaNote(area: Area): string | null {
  return area.sourceUnit === "hectares" ? "reported in hectares" : null;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

export function formatKindLabel(kind: Kind): string {
  switch (kind) {
    case "severeStorm":
      return "Severe storm";
    case "seaLakeIce":
      return "Sea and lake ice";
    case "other":
      return "Other";
    default:
      return kind.charAt(0).toUpperCase() + kind.slice(1);
  }
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
