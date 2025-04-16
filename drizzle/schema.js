import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  date: timestamp('date').defaultNow(),
  projectDetails: jsonb('project_details').notNull(),
  analysis: jsonb('analysis').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});