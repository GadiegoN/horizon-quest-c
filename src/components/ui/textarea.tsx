"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Props = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({
  className,
  label,
  hint,
  error,
  id,
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
          "rounded-(--radius) border bg-card px-3 py-2",
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background",
          error ? "border-danger" : "border-border",
        )}
      >
        <textarea
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "min-h-28 w-full resize-y bg-transparent text-sm outline-none placeholder:text-muted-foreground",
            className,
          )}
          {...rest}
        />
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
