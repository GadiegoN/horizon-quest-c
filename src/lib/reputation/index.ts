export const REPUTATION = {
  pointsPerLevel: 1000,
} as const;

export function clampNonNegativeInt(n: number) {
  if (!Number.isFinite(n)) return 0;
  const v = Math.floor(n);
  return v < 0 ? 0 : v;
}

export function calcLevel(reputationPoints: number) {
  const pts = clampNonNegativeInt(reputationPoints);
  return Math.floor(pts / REPUTATION.pointsPerLevel);
}

export type ReputationSnapshot = {
  reputationPoints: number;
  level: number;
};

export function toReputationSnapshot(
  reputationPoints: number,
): ReputationSnapshot {
  const pts = clampNonNegativeInt(reputationPoints);
  return { reputationPoints: pts, level: calcLevel(pts) };
}
