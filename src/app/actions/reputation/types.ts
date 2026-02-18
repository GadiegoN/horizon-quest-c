export type ReputationEntryType = "EARN" | "REVOKE" | "REVERSAL" | "ADJUSTMENT";

export type ReputationProfileDTO = {
  userId: string;
  reputationPoints: number;
  level: number;
  updatedAt: string;
};

export type ReputationEntryDTO = {
  id: string;
  userId: string;
  deltaPoints: number;
  type: ReputationEntryType;
  referenceId: string;
  description: string | null;
  metadata: unknown | null;
  createdAt: string;
};

export type PageResult<T> = {
  items: T[];
  nextCursor: string | null;
};
