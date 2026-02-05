import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  rating: text("rating").notNull(), // 'very_satisfied', 'satisfied', 'dissatisfied'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === SCHEMAS ===
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ 
  id: true, 
  createdAt: true 
});

// === TYPES ===
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// API Types
export type FeedbackStats = {
  total: number;
  breakdown: {
    very_satisfied: number;
    satisfied: number;
    dissatisfied: number;
  };
  percentages: {
    very_satisfied: string;
    satisfied: string;
    dissatisfied: string;
  };
  dailyCounts: { date: string; count: number }[];
};

export type DateFilter = 'today' | 'week' | 'all';
