import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertFeedback, type FeedbackStats, type DateFilter } from "@shared/schema";

// POST /api/feedback
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertFeedback) => {
      // Validate with shared schema input
      const validated = api.feedback.create.input.parse(data);
      
      const res = await fetch(api.feedback.create.path, {
        method: api.feedback.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.feedback.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to submit feedback');
      }
      return api.feedback.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate stats to reflect new data immediately
      queryClient.invalidateQueries({ queryKey: [api.feedback.stats.path] });
      queryClient.invalidateQueries({ queryKey: [api.feedback.list.path] });
    },
  });
}

// GET /api/stats
export function useFeedbackStats(filter: DateFilter = 'today') {
  return useQuery({
    queryKey: [api.feedback.stats.path, filter],
    queryFn: async () => {
      // Build URL with query params
      const url = `${api.feedback.stats.path}?filter=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return api.feedback.stats.responses[200].parse(await res.json());
    },
  });
}

// GET /api/feedback (List)
export function useFeedbackList(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: [api.feedback.list.path, page, limit],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      const url = `${api.feedback.list.path}?limit=${limit}&offset=${offset}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch feedback history');
      return api.feedback.list.responses[200].parse(await res.json());
    },
  });
}
