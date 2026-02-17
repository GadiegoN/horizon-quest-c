export type CnArg =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean>
  | CnArg[];

export function cn(...args: CnArg[]) {
  const out: string[] = [];

  const push = (v: CnArg) => {
    if (!v) return;

    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
      return;
    }

    if (Array.isArray(v)) {
      v.forEach(push);
      return;
    }

    if (typeof v === "object") {
      for (const [k, ok] of Object.entries(v)) {
        if (ok) out.push(k);
      }
    }
  };

  args.forEach(push);
  return out.join(" ");
}
