"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type EventId = string;

export interface SelectionContextValue {
  selectedEventId: EventId | null;
  setSelectedEventId: (id: EventId | null) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedEventId, setSelectedEventId] = useState<EventId | null>(null);

  const clearSelection = useCallback(() => setSelectedEventId(null), []);

  const value = useMemo(
    () => ({ selectedEventId, setSelectedEventId, clearSelection }),
    [selectedEventId, clearSelection],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return ctx;
}
