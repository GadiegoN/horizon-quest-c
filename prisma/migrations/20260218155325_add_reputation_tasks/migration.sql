-- CreateEnum
CREATE TYPE "ReputationEntryType" AS ENUM ('EARN', 'REVOKE', 'REVERSAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'ASSIGNED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'ELITE');

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reputation_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reputation_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "delta_points" INTEGER NOT NULL,
    "type" "ReputationEntryType" NOT NULL,
    "reference_id" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reputation_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "executor_id" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "difficulty" "TaskDifficulty" NOT NULL,
    "value_cents" INTEGER NOT NULL,
    "rep_reward_points" INTEGER NOT NULL,
    "min_level_required" INTEGER NOT NULL,
    "apply_window_ends_at" TIMESTAMP(3),
    "assigned_at" TIMESTAMP(3),
    "done_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_applications" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "profiles_user_id_idx" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "profiles_reputation_points_idx" ON "profiles"("reputation_points" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "reputation_entries_reference_id_key" ON "reputation_entries"("reference_id");

-- CreateIndex
CREATE INDEX "reputation_entries_user_id_created_at_idx" ON "reputation_entries"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reputation_entries_user_id_reference_id_idx" ON "reputation_entries"("user_id", "reference_id");

-- CreateIndex
CREATE INDEX "tasks_status_created_at_idx" ON "tasks"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "tasks_difficulty_status_created_at_idx" ON "tasks"("difficulty", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "tasks_creator_id_created_at_idx" ON "tasks"("creator_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "tasks_executor_id_created_at_idx" ON "tasks"("executor_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "tasks_apply_window_ends_at_idx" ON "tasks"("apply_window_ends_at");

-- CreateIndex
CREATE INDEX "task_applications_task_id_applied_at_idx" ON "task_applications"("task_id", "applied_at" ASC);

-- CreateIndex
CREATE INDEX "task_applications_user_id_applied_at_idx" ON "task_applications"("user_id", "applied_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "task_applications_task_id_user_id_key" ON "task_applications"("task_id", "user_id");

-- AddForeignKey
ALTER TABLE "reputation_entries" ADD CONSTRAINT "reputation_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_executor_id_fkey" FOREIGN KEY ("executor_id") REFERENCES "profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_applications" ADD CONSTRAINT "task_applications_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_applications" ADD CONSTRAINT "task_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
