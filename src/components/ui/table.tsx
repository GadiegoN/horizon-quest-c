import * as React from "react";
import { cn } from "@/lib/cn";

export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-(--radius) border border-border">
      <table
        className={cn("w-full min-w-130 bg-card text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead {...props} className={cn("bg-muted text-left", props.className)} />
  );
}

export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      {...props}
      className={cn("divide-y divide-border", props.className)}
    />
  );
}

export function TR(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cn("hover:bg-muted/40", props.className)} />;
}

export function TH(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th {...props} className={cn("px-3 py-3 font-semibold", props.className)} />
  );
}

export function TD(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td {...props} className={cn("px-3 py-3 align-middle", props.className)} />
  );
}
