import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const recentExams = pgTable('recent_exam', {
  id: serial('id').primaryKey(),
  examName: varchar('exam_name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'SSC' or 'Others'
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  url: text('url').notNull().unique(), // Unique Constraint
  createdAt: timestamp('created_at').defaultNow(),
});