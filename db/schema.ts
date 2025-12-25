import { pgTable, serial, text, doublePrecision, timestamp, varchar, uniqueIndex } from 'drizzle-orm/pg-core';



export const recentExams = pgTable('recent_exam', {
  id: serial('id').primaryKey(),
  examName: varchar('exam_name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'SSC' or 'Others'
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  url: text('url').notNull().unique(), // Unique Constraint
  createdAt: timestamp('created_at').defaultNow(),
});


export const sscResults = pgTable('SSC_CPO_2025', {
  id: serial('id').primaryKey(),
  rollNo: varchar('roll_no', { length: 50 }).notNull().unique(),
  candidateName: text('candidate_name').notNull(),
  testDate: varchar('test_date', { length: 50 }),
  testTimeShift: varchar('test_time_shift', { length: 100 }),
  centreName: text('centre_name'),
  answerKeyUrl: text('answer_key_url').notNull(),
  
  // Subject-wise Scores
  reasoningScore: doublePrecision('reasoning_score').default(0),
  gkScore: doublePrecision('gk_score').default(0),
  quantScore: doublePrecision('quant_score').default(0),
  englishScore: doublePrecision('english_score').default(0),
  
  // Final Totals
  totalScore: doublePrecision('total_score').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    rollIndex: uniqueIndex('roll_no_idx').on(table.rollNo),
  }
});