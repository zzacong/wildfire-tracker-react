export interface FirstLoadErrorProps {
  onRetry: () => void;
}

export function FirstLoadError({ onRetry }: FirstLoadErrorProps) {
  return (
    <div
      role="alert"
      className="bg-forest text-bone grid h-full w-full place-items-center px-6"
    >
      <div className="border-hairline bg-panel flex max-w-md flex-col items-center gap-4 rounded-[14px] border px-8 py-10 text-center">
        <h1 className="font-display text-[20px] font-bold">
          Couldn&rsquo;t load the wildfire feed
        </h1>
        <p className="text-muted text-sm">
          The first load failed. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="border-hairline text-accent hover:text-bone mt-2 rounded-[8px] border px-5 py-2 font-mono text-xs font-medium tracking-[0.12em] uppercase"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
