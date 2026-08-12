import { FlameIcon } from '../FlameIcon';

export function Masthead() {
  return (
    <header className="border-hairline border-b px-6 pt-[26px] pb-[18px]">
      <div className="flex items-center gap-2">
        <FlameIcon className="text-accent size-[26px]" />
        <h1 className="font-display text-bone text-[30px] leading-none font-bold tracking-[-0.02em]">
          WILDFIRE
        </h1>
      </div>
      <div className="text-muted mt-3 flex items-center gap-2.5 text-xs">
        <span className="text-accent flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-[0.18em] uppercase">
          <span
            aria-hidden="true"
            className="bg-accent size-1.5 animate-pulse rounded-full"
          />
          Live feed
        </span>
        <span aria-hidden="true">·</span>
        <span>NASA EONET v3</span>
      </div>
    </header>
  );
}
