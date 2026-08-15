import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/shell/AppShell";
import { hazardEventsHeaders, hazardEventsLoader } from "@/lib/hazard-events";
import { parseHazardFiltersSearch, type HazardFiltersInput } from "@/lib/hazard-filters";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HazardFiltersInput =>
    parseHazardFiltersSearch(search),
  loaderDeps: ({ search }) => ({ filters: search }),
  loader: hazardEventsLoader,
  headers: hazardEventsHeaders,
  component: Home,
});

function Home() {
  return <AppShell />;
}
