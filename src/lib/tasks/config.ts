export type TaskDifficulty = "EASY" | "MEDIUM" | "HARD" | "ELITE";

export const TASK_DIFFICULTY = {
  repPointsPerDifficulty: {
    EASY: 100,
    MEDIUM: 250,
    HARD: 500,
    ELITE: 1000,
  },
  minLevelRequired: {
    EASY: 0,
    MEDIUM: 1,
    HARD: 3,
    ELITE: 8,
  },
  applyWindowMs: {
    EASY: 0,
    MEDIUM: 2 * 60 * 60 * 1000, // 2h
    HARD: null,
    ELITE: 30 * 60 * 1000, // 30m
  },
} as const;

export type DifficultyConfig = {
  difficulty: TaskDifficulty;
  repRewardPoints: number;
  minLevelRequired: number;
  applyWindowMs: number | null;
  isAutoAssignFirstCome: boolean;
  isAutoPickHighestRepAfterWindow: boolean;
  isManualPickByCreator: boolean;
};

export function getDifficultyConfig(
  difficulty: TaskDifficulty,
): DifficultyConfig {
  const repRewardPoints = TASK_DIFFICULTY.repPointsPerDifficulty[difficulty];
  const minLevelRequired = TASK_DIFFICULTY.minLevelRequired[difficulty];
  const applyWindowMs = TASK_DIFFICULTY.applyWindowMs[difficulty];

  const isAutoAssignFirstCome = difficulty === "EASY";
  const isAutoPickHighestRepAfterWindow =
    difficulty === "MEDIUM" || difficulty === "ELITE";
  const isManualPickByCreator = difficulty === "HARD";

  return {
    difficulty,
    repRewardPoints,
    minLevelRequired,
    applyWindowMs,
    isAutoAssignFirstCome,
    isAutoPickHighestRepAfterWindow,
    isManualPickByCreator,
  };
}

export function computeApplyWindowEndsAt(
  difficulty: TaskDifficulty,
  now = new Date(),
) {
  const cfg = getDifficultyConfig(difficulty);
  if (!cfg.applyWindowMs || cfg.applyWindowMs <= 0) return null;
  return new Date(now.getTime() + cfg.applyWindowMs);
}
