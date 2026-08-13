import { Masthead } from './Masthead';

export interface LedgerRailProps {
  updatedAt: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function LedgerRail({
  updatedAt,
  isRefreshing,
  onRefresh,
}: LedgerRailProps) {
  return (
    <aside
      aria-label="Wildfire ledger"
      className="border-hairline bg-panel flex w-[372px] shrink-0 flex-col border-r"
    >
      <Masthead
        updatedAt={updatedAt}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
      <div
        aria-label="Ledger entries"
        className="min-h-0 flex-1 overflow-y-auto"
      />
    </aside>
  );
}
