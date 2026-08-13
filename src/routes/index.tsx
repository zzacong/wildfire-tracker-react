import { createFileRoute } from '@tanstack/react-router';

import { AppShell } from '#/components/shell/AppShell';
import { wildfiresQueryOptions } from '#/lib/wildfires';

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(wildfiresQueryOptions('open')),
  component: Home,
});

function Home() {
  return <AppShell />;
}
