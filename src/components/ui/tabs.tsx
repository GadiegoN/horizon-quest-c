"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Tab = { key: string; label: string; badge?: React.ReactNode };

type Props = {
  value: string;
  onChange: (key: string) => void;
  tabs: Tab[];
};

export function Tabs({ value, onChange, tabs }: Props) {
  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto rounded-(--radius) border border-border bg-card p-1">
        {tabs.map((t) => {
          const active = t.key === value;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-[calc(var(--radius)-4px)] px-3 py-2 text-sm font-semibold",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <span>{t.label}</span>
              {t.badge}
            </button>
          );
        })}
      </div>
    </div>
  );
}
