import { z } from 'zod';
import { insertFeedbackSchema, feedback } from './schema';

export const api = {
  feedback: {
    create: {
      method: 'POST' as const,
      path: '/api/feedback',
      input: insertFeedbackSchema,
      responses: {
        201: z.custom<typeof feedback.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/feedback',
      input: z.object({
        limit: z.coerce.number().optional().default(50),
        offset: z.coerce.number().optional().default(0),
      }).optional(),
      responses: {
        200: z.object({
          items: z.array(z.custom<typeof feedback.$inferSelect>()),
          total: z.number(),
        }),
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/stats',
      input: z.object({
        filter: z.enum(['today', 'week', 'all']).optional().default('today'),
      }).optional(),
      responses: {
        200: z.custom<{
          total: number;
          breakdown: Record<string, number>;
          percentages: Record<string, string>;
          dailyCounts: { date: string; count: number }[];
        }>(),
      },
    },
    export: {
      method: 'GET' as const,
      path: '/api/export/:format', // format: 'csv' | 'txt'
      responses: {
        200: z.string(), // Returns raw file content
      },
    },
  },
};
