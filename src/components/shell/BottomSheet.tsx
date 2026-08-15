"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DISMISS_DISTANCE_PX = 112;
const FLING_DISTANCE_PX = 48;
const FLING_WINDOW_MS = 300;

/**
 * Mobile bottom sheet (md and down). Slide-up panel with a grab handle,
 * drag/swipe-to-dismiss, a tap-to-dismiss backdrop, Escape support and a
 * basic focus trap. On desktop it is hidden entirely — the shell renders
 * its own floating panels.
 */
export function BottomSheet({ open, onClose, ariaLabel, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{ startY: number; startTime: number; deltaY: number } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "Tab") {
        const sheet = sheetRef.current;
        if (!sheet) {
          return;
        }
        const focusable = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
        if (focusable.length === 0) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      const sheet = sheetRef.current;
      const focusable = sheet?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable ?? sheet)?.focus();
    } else if (openerRef.current) {
      openerRef.current.focus();
      openerRef.current = null;
    }
  }, [open]);

  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const sheet = sheetRef.current;
    if (!open || !sheet) {
      return;
    }
    dragRef.current = { startY: event.clientY, startTime: event.timeStamp, deltaY: 0 };
    sheet.style.transition = "none";
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onHandlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const sheet = sheetRef.current;
    if (!drag || !sheet) {
      return;
    }
    const deltaY = Math.max(0, event.clientY - drag.startY);
    drag.deltaY = deltaY;
    sheet.style.transform = `translateY(${deltaY}px)`;
  }

  function onHandlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const sheet = sheetRef.current;
    dragRef.current = null;
    if (!drag || !sheet) {
      return;
    }
    const flung =
      drag.deltaY > FLING_DISTANCE_PX && event.timeStamp - drag.startTime < FLING_WINDOW_MS;
    sheet.style.transition = "";
    sheet.style.transform = "";
    if (drag.deltaY > DISMISS_DISTANCE_PX || flung) {
      onClose();
    }
  }

  function onHandlePointerCancel() {
    const sheet = sheetRef.current;
    dragRef.current = null;
    if (!sheet) {
      return;
    }
    sheet.style.transition = "";
    sheet.style.transform = "";
  }

  return (
    <>
      <div
        aria-hidden={!open}
        inert={!open}
        onClick={onClose}
        className={cn(
          "pointer-events-auto fixed inset-0 z-60 bg-black/60 transition-opacity duration-300 motion-reduce:transition-none md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        ref={sheetRef}
        data-slot="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-hidden={!open}
        inert={!open}
        tabIndex={open ? -1 : undefined}
        className={cn(
          "glass pointer-events-auto fixed inset-x-0 bottom-0 z-70 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl border border-border border-b-0 pb-[env(safe-area-inset-bottom)]",
          "shadow-[0_-16px_48px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div
          aria-hidden
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerCancel}
          className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
        >
          <span className="h-1 w-10 rounded-full bg-foreground/20" />
        </div>
        {children}
      </div>
    </>
  );
}
