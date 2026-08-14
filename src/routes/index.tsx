import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { hazardEventsHeaders, hazardEventsLoader } from "@/lib/hazard-events";

export const Route = createFileRoute("/")({
  loader: hazardEventsLoader,
  headers: hazardEventsHeaders,
  component: Home,
});

function Home() {
  return <AppShell />;
}
