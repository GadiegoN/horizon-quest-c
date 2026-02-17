export function safeNextPath(next: string | null | undefined) {
  if (!next) return "/wallet";
  if (!next.startsWith("/")) return "/wallet";
  if (next.startsWith("//")) return "/wallet";
  return next;
}
