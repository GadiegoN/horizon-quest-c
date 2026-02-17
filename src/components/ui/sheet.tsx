"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

function useEscClose(open: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: Props) {
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => setMounted(true), []);
  useEscClose(open, () => onOpenChange(false));

  React.useEffect(() => {
    if (!open) return;
    setTimeout(() => panelRef.current?.focus(), 0);
  }, [open]);

  if (!mounted) return null;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" aria-hidden={false}>
      <div
        className="absolute inset-0 bg-black/50"
        onMouseDown={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialog"}
        tabIndex={-1}
        ref={panelRef}
        className={cn(
          "absolute left-1/2 top-auto w-full -translate-x-1/2 outline-none",
          "bottom-0 rounded-t-[20px] border border-border bg-card shadow-xl",
          "md:top-1/2 md:bottom-auto md:max-w-lg md:-translate-y-1/2 md:rounded-[20px]",
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="p-4">
            {title ? (
              <div className="text-base font-semibold">{title}</div>
            ) : null}
            {description ? (
              <div className="mt-1 text-sm text-muted-foreground">
                {description}
              </div>
            ) : null}
          </div>
        )}

        <div className="max-h-[70dvh] overflow-auto px-4 pb-4">{children}</div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {footer}
        </div>
      </div>
    </div>,
    document.body,
  );
}
