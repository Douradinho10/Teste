import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.feedback.create.path, async (req, res) => {
    try {
      const input = api.feedback.create.input.parse(req.body);
      const result = await storage.createFeedback(input);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.feedback.list.path, async (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const result = await storage.getFeedbackList(limit, offset);
    res.json(result);
  });

  app.get(api.feedback.stats.path, async (req, res) => {
    const filter = (req.query.filter as 'today' | 'week' | 'all') || 'today';
    const stats = await storage.getStats(filter);
    res.json(stats);
  });

  app.get(api.feedback.export.path, async (req, res) => {
    const format = req.params.format;
    const data = await storage.getAllFeedbackForExport();

    if (format === 'csv') {
      const header = "ID,Feedback,Data,Hora,DiaDaSemana\n";
      const rows = data.map(item => {
        const date = new Date(item.createdAt);
        const dayOfWeek = date.toLocaleDateString('pt-PT', { weekday: 'long' });
        const dateStr = date.toLocaleDateString('pt-PT');
        const timeStr = date.toLocaleTimeString('pt-PT');
        const ratingLabel = item.rating === 'very_satisfied' ? 'muito satisfeito' :
                           item.rating === 'satisfied' ? 'satisfeito' : 'insatisfeito';
        return `${item.id},${ratingLabel},${dateStr},${timeStr},${dayOfWeek}`;
      }).join("\n");
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="feedback.csv"');
      return res.send(header + rows);
    } 
    
    if (format === 'txt') {
      const rows = data.map(item => {
        const date = new Date(item.createdAt);
        const ratingLabel = item.rating === 'very_satisfied' ? 'muito satisfeito' :
                           item.rating === 'satisfied' ? 'satisfeito' : 'insatisfeito';
        return `ID:${item.id} Feedback:${ratingLabel} Data:${date.toLocaleString('pt-PT')}`;
      }).join("\n");
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="feedback.txt"');
      return res.send(rows);
    }

    res.status(400).send("Invalid format");
  });

  return httpServer;
}

// Simple seed function to add some initial data if empty
async function seedData() {
  const stats = await storage.getStats('all');
  if (stats.total === 0) {
    console.log("Seeding initial feedback data...");
    const ratings = ['very_satisfied', 'satisfied', 'dissatisfied'] as const;
    
    // Add some random data for the last 7 days
    for (let i = 0; i < 20; i++) {
      const randomRating = ratings[Math.floor(Math.random() * ratings.length)];
      // Hacky way to seed past data - in real app we'd need to allow setting createdAt or manipulate DB
      // Since our schema uses defaultNow(), we can't easily backdate without modifying schema or raw SQL
      // For now, we'll just insert current data which is fine for "fresh" look
      await storage.createFeedback({ rating: randomRating });
    }
  }
}

// Call seed after a short delay to ensure DB is ready
setTimeout(seedData, 5000);
