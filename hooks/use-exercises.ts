"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseCategories,
  getMuscleGroups,
} from "@/app/actions/exercises";

// Query keys
export const exerciseKeys = {
  all: ["exercises"] as const,
  lists: () => [...exerciseKeys.all, "list"] as const,
  list: (filters?: any) => [...exerciseKeys.lists(), { filters }] as const,
  details: () => [...exerciseKeys.all, "detail"] as const,
  detail: (id: string) => [...exerciseKeys.details(), id] as const,
  categories: () => [...exerciseKeys.all, "categories"] as const,
  muscleGroups: () => [...exerciseKeys.all, "muscleGroups"] as const,
};

/**
 * Fetch all exercises with optional filters
 */
export function useExercises(filters?: {
  category?: string;
  muscleGroup?: string;
  createdByMe?: boolean;
}) {
  return useQuery({
    queryKey: exerciseKeys.list(filters),
    queryFn: () => getExercises(filters),
  });
}

/**
 * Fetch a single exercise by ID
 */
export function useExercise(id: string) {
  return useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => getExercise(id),
    enabled: !!id,
  });
}

/**
 * Fetch all exercise categories
 */
export function useExerciseCategories() {
  return useQuery({
    queryKey: exerciseKeys.categories(),
    queryFn: getExerciseCategories,
  });
}

/**
 * Fetch all muscle groups
 */
export function useMuscleGroups() {
  return useQuery({
    queryKey: exerciseKeys.muscleGroups(),
    queryFn: getMuscleGroups,
  });
}

/**
 * Create a new exercise
 */
export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExercise,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.categories() });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.muscleGroups() });
    },
  });
}

/**
 * Update an existing exercise
 */
export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateExercise(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific exercise and list
      queryClient.invalidateQueries({
        queryKey: exerciseKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
    },
  });
}

/**
 * Delete an exercise
 */
export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => {
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
    },
  });
}
