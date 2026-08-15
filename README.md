Welcome to your new TanStack Start app!

# Getting Started

To run this application:

```bash
pnpm install
pnpm dev
```

# Building For Production

To build this application for production:

```bash
pnpm build
```

# Code Quality

Linting and formatting are handled by the Oxc tools — **oxlint** for linting and **oxfmt** for formatting.

- `pnpm lint` — runs `oxlint` (config in `.oxlintrc.json`, React/TS plugins enabled).
- `pnpm fmt` — formats all files with `oxfmt` (config in `.oxfmtrc.json`, includes import + Tailwind class sorting).
- `pnpm fmt:check` — verifies formatting without writing.
- `pnpm typecheck` — runs `tsc --noEmit`.
- `pnpm test` — runs the Vitest suite.
- `pnpm check` — runs lint, format check, typecheck, and tests in one command. Run this before pushing.

Both tools auto-discover their config files and honor `.gitignore`; ignore patterns live in `.oxfmtrc.json` (`ignorePatterns`).

# Deployment (Vercel)

Hosting is **Vercel**, deployed via the [Nitro](https://nitro.build/) Vite plugin (`nitro` in `vite.config.ts`). No environment secrets are required — EONET and OpenFreeMap are keyless. `vercel.json` pins the framework preset so Vercel always builds it as a TanStack Start app.

Deploy via CLI (preview):

```bash
vercel deploy --no-wait --scope <team-slug>
```

Or push to the Git remote — Vercel detects TanStack Start/Nitro and builds automatically. On Vercel, Nitro auto-detects the `vercel` preset and emits `.vercel/output` (serverless `__server` function + static assets).

Verification checklist for a live deploy:

- `pnpm build` passes locally and produces Nitro SSR output (`.output/` locally, `.vercel/output` on Vercel).
- The deployed root returns `200` with server-rendered HTML (route content present in the raw HTML, not just after hydration).
- Client assets (CSS/JS) load with `200`.
- Server functions return expected payloads (once the EONET data layer lands in ticket #02).
- Force an upstream EONET failure and confirm the stale-data fallback + banner render rather than an error page (ticket #02).

> Note: the per-deployment `*.vercel.app` URLs are SSO-protected by default; use the project alias (e.g. `https://<project>.vercel.app`) for unauthenticated checks.

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Remove `@tailwindcss/vite` and `tailwindcss` from `package.json`

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "My App" },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
});
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from "@tanstack/react-start";

const getServerTime = createServerFn({
  method: "GET",
}).handler(async () => {
  return new Date().toISOString();
});

// Use in a component
function MyComponent() {
  const [time, setTime] = useState("");

  useEffect(() => {
    getServerTime().then(setTime);
  }, []);

  return <div>Server time: {time}</div>;
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/hello")({
  server: {
    handlers: {
      GET: () => json({ message: "Hello, World!" }),
    },
  },
});
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/people")({
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json();
  },
  component: PeopleComponent,
});

function PeopleComponent() {
  const data = Route.useLoaderData();
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  );
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
