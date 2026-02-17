export type RateLimitKey = {
  userId: string;
  action: "reward" | "purchase" | "reverse";
};

export async function assertRateLimit(_key: RateLimitKey) {
  return { ok: true as const };
}
