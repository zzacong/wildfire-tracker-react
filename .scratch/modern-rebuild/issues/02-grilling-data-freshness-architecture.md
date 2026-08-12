# Grilling: Data freshness & fetching architecture

Type: grilling
Status: open
Blocked by:

## Question

How fresh must the live map be, and what data architecture delivers that on TanStack Start? Decide:

- Fetch path: server loader (SSR, cached) vs client TanStack Query with polling vs a server function + query on the client.
- Refetch cadence: 5m, 15m, on-load only? stale-while-revalidate handling.
- How one EONET request feeds the map markers, the filters, and the detail panel (shared cache, derived state).
- Loading / error / stale-while-revalidate UX for a public product.

Output: a concrete data-flow decision the spec can encode.

## Answer
