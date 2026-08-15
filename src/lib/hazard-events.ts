import { createServerFn } from "@tanstack/react-start";

import { getHazardEventsResult } from "./eonet.server";
import type { HazardFiltersInput } from "./hazard-filters";

export const getHazardEvents = createServerFn({ method: "GET" })
  .validator((data: HazardFiltersInput | undefined) => data)
  .handler(({ data }) => getHazardEventsResult(data));

export const hazardEventsLoader = (opts?: { deps?: { filters?: HazardFiltersInput } }) =>
  getHazardEvents({ data: opts?.deps?.filters });

export function hazardEventsHeaders() {
  return {
    "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
  };
}
