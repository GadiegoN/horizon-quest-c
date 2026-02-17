import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "accent";

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    neutral: "bg-muted text-foreground",
    primary: "bg-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
    accent: "bg-accent text-accent-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
