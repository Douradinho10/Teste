import { db } from "./db";
import { feedback, type InsertFeedback, type Feedback } from "@shared/schema";
import { count, desc, eq, sql, gte, and } from "drizzle-orm";

export interface IStorage {
  createFeedback(entry: InsertFeedback): Promise<Feedback>;
  getFeedbackList(limit: number, offset: number): Promise<{ items: Feedback[], total: number }>;
  getStats(filter: 'today' | 'week' | 'all'): Promise<{
    total: number;
    breakdown: Record<string, number>;
    percentages: Record<string, string>;
    dailyCounts: { date: string; count: number }[];
  }>;
  getAllFeedbackForExport(): Promise<Feedback[]>;
}

export class DatabaseStorage implements IStorage {
  async createFeedback(entry: InsertFeedback): Promise<Feedback> {
    const [result] = await db.insert(feedback).values(entry).returning();
    return result;
  }

  async getFeedbackList(limit: number, offset: number): Promise<{ items: Feedback[], total: number }> {
    const [countResult] = await db.select({ count: count() }).from(feedback);
    const items = await db.select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt))
      .limit(limit)
      .offset(offset);
    
    return {
      items,
      total: countResult.count,
    };
  }

  async getAllFeedbackForExport(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async getStats(filter: 'today' | 'week' | 'all') {
    let whereClause = undefined;
    const now = new Date();
    
    if (filter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      whereClause = gte(feedback.createdAt, startOfDay);
    } else if (filter === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      whereClause = gte(feedback.createdAt, startOfWeek);
    }

    const items = await db.select().from(feedback).where(whereClause);
    
    const total = items.length;
    const breakdown = {
      very_satisfied: items.filter(i => i.rating === 'very_satisfied').length,
      satisfied: items.filter(i => i.rating === 'satisfied').length,
      dissatisfied: items.filter(i => i.rating === 'dissatisfied').length,
    };

    const percentages = {
      very_satisfied: total ? ((breakdown.very_satisfied / total) * 100).toFixed(1) : "0.0",
      satisfied: total ? ((breakdown.satisfied / total) * 100).toFixed(1) : "0.0",
      dissatisfied: total ? ((breakdown.dissatisfied / total) * 100).toFixed(1) : "0.0",
    };

    // Simple daily aggregation
    const dailyMap = new Map<string, number>();
    items.forEach(item => {
      const dateStr = item.createdAt.toISOString().split('T')[0];
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
    });

    const dailyCounts = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { total, breakdown, percentages, dailyCounts };
  }
}

export const storage = new DatabaseStorage();
