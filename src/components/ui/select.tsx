"use client";

import { cn } from "@/lib/cn";
import * as React from "react";
type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Select({
  label,
  hint,
  error,
  id,
  className,
  children,
  ...rest
}: Props) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={selectId} className="mb-1 block text-sm font-semibold">
          {label}
        </label>
      ) : null}

      <select
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(
          "h-11 w-full rounded-(--radius) border bg-card px-3 text-sm font-medium outline-none",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          error ? "border-danger" : "border-border",
          className,
        )}
        {...rest}
      >
        {children}
      </select>

      {error ? (
        <p id={errorId} className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1 text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
