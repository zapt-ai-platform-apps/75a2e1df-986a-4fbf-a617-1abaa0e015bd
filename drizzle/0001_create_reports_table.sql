CREATE TABLE IF NOT EXISTS "reports" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "date" TIMESTAMP DEFAULT NOW(),
  "project_details" JSONB NOT NULL,
  "analysis" JSONB NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "reports_user_id_idx" ON "reports" ("user_id");