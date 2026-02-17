"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  hint?: string;
  error?: string;
  rightSlot?: React.ReactNode;
};

export function Input({
  className,
  label,
  hint,
  error,
  id,
  rightSlot,
  ...rest
}: Props) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1 block text-sm font-semibold">
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          "flex items-center gap-2 rounded-(--radius) border bg-card px-3",
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background",
          error ? "border-danger" : "border-border",
        )}
      >
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground",
            className,
          )}
          {...rest}
        />
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>

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
