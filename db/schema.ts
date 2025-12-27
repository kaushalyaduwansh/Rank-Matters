import { pgTable, serial, text, doublePrecision, timestamp, varchar, uniqueIndex,integer,jsonb } from 'drizzle-orm/pg-core';

export const recentExams = pgTable('recent_exam', {
  id: serial('id').primaryKey(), // Auto-Generated Exam ID
  examName: varchar('exam_name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'SSC', 'RRB', 'BANK', 'OTHERS'
  
  // New Fields
  totalQuestions: integer('total_questions').notNull().default(100),
  rightMark: doublePrecision('right_mark').notNull().default(1.0),
  wrongMark: doublePrecision('wrong_mark').notNull().default(0.0),
  
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  url: text('url').notNull().unique(), // Unique Slug
  createdAt: timestamp('created_at').defaultNow(),
});

export const sscResults = pgTable('ssc_results', {
  id: serial('id').primaryKey(),
  
  // NEW: Link result to specific exam
  examId: integer('exam_id').references(() => recentExams.id), 
  
  rollNo: varchar('roll_no', { length: 50 }).notNull(),
  candidateName: text('candidate_name').notNull(),
  
  // NEW: Category
  category: varchar('category', { length: 20 }).default('UR'), 

  testDate: varchar('test_date', { length: 50 }),
  testTimeShift: varchar('test_time_shift', { length: 100 }),
  centreName: text('centre_name'),
  answerKeyUrl: text('answer_key_url').notNull(),
  
  reasoningScore: doublePrecision('reasoning_score').default(0),
  gkScore: doublePrecision('gk_score').default(0),
  quantScore: doublePrecision('quant_score').default(0),
  englishScore: doublePrecision('english_score').default(0),
  
  totalScore: doublePrecision('total_score').notNull(),

  // NEW: Store section-wise analysis
  sectionDetails: jsonb('section_details'), 

  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    // Unique: One roll number per exam
    rollExamIdx: uniqueIndex('roll_exam_idx').on(table.rollNo, table.examId),
  }
});


export const rrbResults = pgTable('rrb_results', {
  id: serial('id').primaryKey(),
  examId: integer('exam_id').notNull(), // Relates to recentExams.id
  
  // Identity
  rollNo: varchar('roll_no', { length: 50 }).notNull(),
  candidateName: text('candidate_name').notNull(),
  
  // RRB Specifics
  rrbZone: varchar('rrb_zone', { length: 100 }).default('Unknown'), // New Field
  category: varchar('category', { length: 50 }).default('UR'),
  
  // Exam Details
  testDate: varchar('test_date', { length: 50 }),
  testTimeShift: varchar('test_time_shift', { length: 100 }),
  centreName: text('centre_name'),
  answerKeyUrl: text('answer_key_url').notNull(),
  
  // Scoring (Float because 1/3 negative marking creates decimals)
  totalScore: doublePrecision('total_score').notNull(),
  totalCorrect: integer('total_correct').default(0),
  totalWrong: integer('total_wrong').default(0),
  totalUnattempted: integer('total_unattempted').default(0),

  // Detailed Stats (Stores Section-wise data as JSON)
  // Example: [{ subject: "General Awareness", right: 10, wrong: 2, score: 9.33 }]
  sectionDetails: jsonb('section_details').$type<any[]>().default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    // Composite unique constraint: One roll number per exam
    uniqueRollExam: uniqueIndex('rrb_roll_exam_idx').on(table.rollNo, table.examId),
  }
});


export const BankResults = pgTable('bank_results', {
  id: serial('id').primaryKey(),
  examId: integer('exam_id').notNull(), // Relates to recentExams.id
  
  // Identity
  rollNo: varchar('roll_no', { length: 50 }).notNull(),
  candidateName: text('candidate_name').notNull(),

  // Bank Specifics
  state: varchar('state', { length: 100 }).default('Unknown'), // New Field
  category: varchar('category', { length: 50 }).default('UR'),
  
  // Exam Details
  testDate: varchar('test_date', { length: 50 }),
  testTimeShift: varchar('test_time_shift', { length: 100 }),
  centreName: text('centre_name'),
  answerKeyUrl: text('answer_key_url').notNull(),
  totalScore: doublePrecision('total_score').notNull(),
  totalCorrect: integer('total_correct').default(0),
  totalWrong: integer('total_wrong').default(0),
  totalUnattempted: integer('total_unattempted').default(0),

  // Detailed Stats (Stores Section-wise data as JSON)
  // Example: [{ subject: "General Awareness", right: 10, wrong: 2, score: 9.33 }]
  sectionDetails: jsonb('section_details').$type<any[]>().default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    // Composite unique constraint: One roll number per exam
    uniqueRollExam: uniqueIndex('bank_roll_exam_idx').on(table.rollNo, table.examId),
  }
});


export const OtherResults = pgTable('other_results', {
  id: serial('id').primaryKey(),
  examId: integer('exam_id').notNull(), // Relates to recentExams.id
  
  // Identit
  rollNo: varchar('roll_no', { length: 50 }).notNull(),
  candidateName: text('candidate_name').notNull(),

  
  category: varchar('category', { length: 50 }).default('UR'),
  testDate: varchar('test_date', { length: 50 }),
  testTimeShift: varchar('test_time_shift', { length: 100 }),
  centreName: text('centre_name'),
  answerKeyUrl: text('answer_key_url').notNull(),
  totalScore: doublePrecision('total_score').notNull(),
  totalCorrect: integer('total_correct').default(0),
  totalWrong: integer('total_wrong').default(0),
  totalUnattempted: integer('total_unattempted').default(0),
  sectionDetails: jsonb('section_details').$type<any[]>().default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    uniqueRollExam: uniqueIndex('others_roll_exam_idx').on(table.rollNo, table.examId),
  }
});