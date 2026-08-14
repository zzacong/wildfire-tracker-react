import { createServerFn } from "@tanstack/react-start";

import { getHazardEventsResult } from "./eonet.server";

export const getHazardEvents = createServerFn({ method: "GET" }).handler(() => {
  return getHazardEventsResult();
});

export const hazardEventsLoader = () => getHazardEvents();

export function hazardEventsHeaders() {
  return {
    "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
  };
}
