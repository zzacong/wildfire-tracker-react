import { Masthead } from './Masthead';

export function LedgerRail() {
  return (
    <aside
      aria-label="Wildfire ledger"
      className="border-hairline bg-panel flex w-[372px] shrink-0 flex-col border-r"
    >
      <Masthead />
      <div
        aria-label="Ledger entries"
        className="min-h-0 flex-1 overflow-y-auto"
      />
    </aside>
  );
}
