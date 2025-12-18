"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserRoutines,
  getRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  cloneRoutine,
} from "@/app/actions/routines";

// Query keys
export const routineKeys = {
  all: ["routines"] as const,
  lists: () => [...routineKeys.all, "list"] as const,
  list: (includePublic?: boolean) =>
    [...routineKeys.lists(), { includePublic }] as const,
  details: () => [...routineKeys.all, "detail"] as const,
  detail: (id: string) => [...routineKeys.details(), id] as const,
};

/**
 * Fetch user's routines
 */
export function useRoutines(includePublic = false) {
  return useQuery({
    queryKey: routineKeys.list(includePublic),
    queryFn: () => getUserRoutines(includePublic),
  });
}

/**
 * Fetch a single routine by ID
 */
export function useRoutine(id: string) {
  return useQuery({
    queryKey: routineKeys.detail(id),
    queryFn: () => getRoutine(id),
    enabled: !!id,
  });
}

/**
 * Create a new routine
 */
export function useCreateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.lists() });
    },
  });
}

/**
 * Update an existing routine
 */
export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateRoutine(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: routineKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: routineKeys.lists() });
    },
  });
}

/**
 * Delete a routine
 */
export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.lists() });
    },
  });
}

/**
 * Clone/duplicate a routine
 */
export function useCloneRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cloneRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.lists() });
    },
  });
}
