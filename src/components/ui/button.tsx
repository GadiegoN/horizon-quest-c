"use client";

import { cn } from "@/lib/cn";
import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-(--radius) font-semibold",
        "transition active:translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-sm hover:brightness-110",
        variant === "secondary" &&
          "bg-muted text-foreground hover:brightness-105 border border-border",
        variant === "ghost" &&
          "bg-transparent text-foreground hover:bg-muted/60",
        variant === "danger" &&
          "bg-danger text-danger-foreground shadow-sm hover:brightness-110",
        className,
      )}
    >
      {loading ? <Spinner /> : leftIcon}
      <span className="truncate">{children}</span>
      {!loading && rightIcon}
    </button>
  );
}
