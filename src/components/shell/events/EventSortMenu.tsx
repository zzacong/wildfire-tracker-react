"use client";

import { useId } from "react";
import { ArrowUpDownIcon, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { EventSort } from "./sort";

interface SortOption {
  sort: EventSort;
  keyLabel: string;
  directionLabel: string;
}

const OPTIONS: SortOption[] = [
  { sort: { key: "date", direction: "desc" }, keyLabel: "Date", directionLabel: "Newest first" },
  { sort: { key: "date", direction: "asc" }, keyLabel: "Date", directionLabel: "Oldest first" },
  { sort: { key: "area", direction: "desc" }, keyLabel: "Area", directionLabel: "Largest first" },
  { sort: { key: "area", direction: "asc" }, keyLabel: "Area", directionLabel: "Smallest first" },
];

interface EventSortMenuProps {
  sort: EventSort;
  onSortChange: (sort: EventSort) => void;
}

export function EventSortMenu({ sort, onSortChange }: EventSortMenuProps) {
  const radioName = useId();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Sort events">
            <ArrowUpDownIcon />
          </Button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-60">
        <PopoverHeader>
          <PopoverTitle>Sort events</PopoverTitle>
          <PopoverDescription>Order the list by date or reported area.</PopoverDescription>
        </PopoverHeader>
        <div role="radiogroup" aria-label="Sort order" className="flex flex-col gap-0.5">
          {OPTIONS.map((option) => {
            const active = option.sort.key === sort.key && option.sort.direction === sort.direction;
            return (
              <label
                key={`${option.sort.key}-${option.sort.direction}`}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                  "has-focus-visible:ring-2 has-focus-visible:ring-ring/50",
                  active
                    ? "bg-muted/70 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <input
                  type="radio"
                  name={radioName}
                  value={`${option.sort.key}-${option.sort.direction}`}
                  checked={active}
                  onChange={() => onSortChange(option.sort)}
                  className="sr-only"
                />
                <span className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {option.keyLabel}
                  </span>
                  <span>{option.directionLabel}</span>
                </span>
                <CheckIcon
                  className={cn(
                    "size-3.5 shrink-0 text-primary",
                    active ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
