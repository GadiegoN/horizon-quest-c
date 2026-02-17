"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type ToastTone = "neutral" | "success" | "warning" | "danger";

export type ToastItem = {
  id: string;
  title?: string;
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastContextValue = {
  toast: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = uid();
      const item: ToastItem = {
        id,
        tone: t.tone ?? "neutral",
        durationMs: t.durationMs ?? 3500,
        title: t.title,
        message: t.message,
      };

      setItems((prev) => [item, ...prev].slice(0, 4));

      window.setTimeout(() => dismiss(id), item.durationMs);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToasterInternal items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function Toaster() {
  return null;
}

function ToasterInternal({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-x-0 top-3 z-100 mx-auto w-full max-w-md px-3">
      <div className="flex flex-col gap-2">
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={onDismiss} />
        ))}
      </div>
    </div>,
    document.body,
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const toneCls =
    item.tone === "success"
      ? "border-success"
      : item.tone === "warning"
        ? "border-warning"
        : item.tone === "danger"
          ? "border-danger"
          : "border-border";

  return (
    <div
      className={cn(
        "rounded-(--radius) border bg-card p-3 shadow-lg",
        "flex items-start justify-between gap-3",
        toneCls,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="min-w-0">
        {item.title ? (
          <div className="text-sm font-semibold">{item.title}</div>
        ) : null}
        <div className="text-sm text-muted-foreground">{item.message}</div>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="rounded-md px-2 py-1 text-sm font-semibold hover:bg-muted"
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </div>
  );
}
