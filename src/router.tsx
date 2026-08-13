import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
  hydrate,
} from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    context: { queryClient },
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  router.options.dehydrate = () => ({
    queryClientState: dehydrate(queryClient),
  });
  router.options.hydrate = (dehydrated) => {
    hydrate(queryClient, dehydrated.queryClientState);
  };

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
