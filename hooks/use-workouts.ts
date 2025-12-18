"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  startWorkout,
  logSet,
  completeWorkout,
  getWorkoutHistory,
  getWorkout,
  deleteWorkout,
  getPersonalRecords,
  getWorkoutStats,
} from "@/app/actions/workouts";

// Query keys
export const workoutKeys = {
  all: ["workouts"] as const,
  history: () => [...workoutKeys.all, "history"] as const,
  historyList: (limit?: number, offset?: number) =>
    [...workoutKeys.history(), { limit, offset }] as const,
  details: () => [...workoutKeys.all, "detail"] as const,
  detail: (id: string) => [...workoutKeys.details(), id] as const,
  prs: () => [...workoutKeys.all, "prs"] as const,
  stats: () => [...workoutKeys.all, "stats"] as const,
};

/**
 * Fetch workout history
 */
export function useWorkoutHistory(limit = 20, offset = 0) {
  return useQuery({
    queryKey: workoutKeys.historyList(limit, offset),
    queryFn: () => getWorkoutHistory(limit, offset),
  });
}

/**
 * Fetch a single workout by ID
 */
export function useWorkout(id: string) {
  return useQuery({
    queryKey: workoutKeys.detail(id),
    queryFn: () => getWorkout(id),
    enabled: !!id,
  });
}

/**
 * Fetch personal records
 */
export function usePersonalRecords() {
  return useQuery({
    queryKey: workoutKeys.prs(),
    queryFn: getPersonalRecords,
  });
}

/**
 * Fetch workout stats
 */
export function useWorkoutStats() {
  return useQuery({
    queryKey: workoutKeys.stats(),
    queryFn: getWorkoutStats,
  });
}

/**
 * Start a new workout
 */
export function useStartWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.history() });
    },
  });
}

/**
 * Log a set during workout
 */
export function useLogSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutId, setData }: { workoutId: string; setData: any }) =>
      logSet(workoutId, setData),
    onSuccess: (_, variables) => {
      // Invalidate the specific workout
      queryClient.invalidateQueries({
        queryKey: workoutKeys.detail(variables.workoutId),
      });
      // Also invalidate PRs since they might have been updated
      queryClient.invalidateQueries({ queryKey: workoutKeys.prs() });
    },
  });
}

/**
 * Complete a workout
 */
export function useCompleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeWorkout,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.detail(variables.workoutId),
      });
      queryClient.invalidateQueries({ queryKey: workoutKeys.history() });
      queryClient.invalidateQueries({ queryKey: workoutKeys.stats() });
    },
  });
}

/**
 * Delete a workout
 */
export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.history() });
      queryClient.invalidateQueries({ queryKey: workoutKeys.stats() });
    },
  });
}
