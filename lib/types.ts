import { z } from "zod";
import type { Prisma } from "@prisma/client";

// ============================================================================
// SERVER ACTION RESPONSE TYPE
// ============================================================================

export type ActionResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Exercise Schemas
export const exerciseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  muscleGroups: z.array(z.string()).min(1, "At least one muscle group is required"),
  equipmentNeeded: z.string().optional(),
  instructions: z.string().optional(),
  videoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  demoGifUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  isPublic: z.boolean().default(true),
});

// Workout Exercise Schemas (for routines)
export const workoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Exercise is required"),
  orderIndex: z.number().int().min(0),
  targetSets: z.number().int().min(1, "At least 1 set required"),
  targetReps: z.number().int().min(1).optional(),
  targetDuration: z.number().int().min(1).optional(),
  restPeriod: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  supersetGroup: z.number().int().min(0).optional(),
});

// Routine Schemas
export const routineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const createRoutineSchema = routineSchema.extend({
  exercises: z.array(workoutExerciseSchema).min(1, "At least one exercise is required"),
});

// Workout/Set Log Schemas
export const setLogSchema = z.object({
  exerciseId: z.string(),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  duration: z.number().int().min(0).optional(),
  completed: z.boolean().default(true),
  notes: z.string().optional(),
});

export const startWorkoutSchema = z.object({
  routineId: z.string().optional(),
  notes: z.string().optional(),
});

export const completeWorkoutSchema = z.object({
  workoutId: z.string(),
  endTime: z.date().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// FORM DATA TYPES (inferred from schemas)
// ============================================================================

export type ExerciseFormData = z.infer<typeof exerciseSchema>;
export type WorkoutExerciseFormData = z.infer<typeof workoutExerciseSchema>;
export type RoutineFormData = z.infer<typeof routineSchema>;
export type CreateRoutineFormData = z.infer<typeof createRoutineSchema>;
export type SetLogFormData = z.infer<typeof setLogSchema>;
export type StartWorkoutFormData = z.infer<typeof startWorkoutSchema>;
export type CompleteWorkoutFormData = z.infer<typeof completeWorkoutSchema>;

// ============================================================================
// PRISMA RETURN TYPES (with includes)
// ============================================================================

// Exercise with creator
export type ExerciseWithCreator = Prisma.ExerciseGetPayload<{
  include: {
    creator: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

// Workout Exercise with Exercise details
export type WorkoutExerciseWithExercise = Prisma.WorkoutExerciseGetPayload<{
  include: {
    exercise: true;
  };
}>;

// Routine with exercises and creator
export type RoutineWithDetails = Prisma.WorkoutRoutineGetPayload<{
  include: {
    creator: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    exercises: {
      include: {
        exercise: true;
      };
    };
    _count: {
      select: {
        workoutLogs: true;
      };
    };
  };
}>;

// Workout Log with routine and set logs
export type WorkoutLogWithDetails = Prisma.WorkoutLogGetPayload<{
  include: {
    routine: {
      include: {
        exercises: {
          include: {
            exercise: true;
          };
        };
      };
    };
    setLogs: {
      include: {
        exercise: true;
      };
    };
  };
}>;

// Set Log with exercise
export type SetLogWithExercise = Prisma.SetLogGetPayload<{
  include: {
    exercise: true;
  };
}>;

// Workout history item (simplified)
export type WorkoutHistoryItem = Prisma.WorkoutLogGetPayload<{
  include: {
    routine: {
      select: {
        id: true;
        name: true;
      };
    };
    _count: {
      select: {
        setLogs: true;
      };
    };
  };
}>;

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

// Exercise types for components
export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipmentNeeded?: string | null;
  instructions?: string | null;
  videoUrl?: string | null;
  demoGifUrl?: string | null;
  isPublic: boolean;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Workout Exercise for forms and displays
export interface WorkoutExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetReps?: number | null;
  targetDuration?: number | null;
  restPeriod?: number | null;
  notes?: string | null;
  supersetGroup?: number | null;
  exercise?: Exercise;
}

// Routine for components
export interface WorkoutRoutine {
  id: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  exercises?: WorkoutExercise[];
  creator?: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Set Log for components
export interface SetLog {
  id: string;
  workoutId: string;
  exerciseId: string;
  setNumber: number;
  reps?: number | null;
  weight?: number | null;
  duration?: number | null;
  completed: boolean;
  notes?: string | null;
  timestamp: Date;
  exercise?: Exercise;
}

// Workout Log for components
export interface WorkoutLog {
  id: string;
  userId: string;
  routineId?: string | null;
  startTime: Date;
  endTime?: Date | null;
  totalDuration?: number | null;
  notes?: string | null;
  routine?: WorkoutRoutine | null;
  setLogs?: SetLog[];
}

// ============================================================================
// WORKOUT SESSION SUMMARY
// ============================================================================

export interface ExerciseSummary {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  totalReps: number;
  totalWeight: number;
  maxWeight: number;
  avgWeight: number;
  totalDuration: number;
}

export interface WorkoutSessionSummary {
  workoutLog: WorkoutLog;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  exerciseSummaries: ExerciseSummary[];
  duration: number; // in minutes
  completionRate: number; // percentage
}

// ============================================================================
// STATS AND ANALYTICS
// ============================================================================

export interface WorkoutStats {
  totalWorkouts: number;
  totalSets: number;
  workoutsThisWeek: number;
  totalMinutesThisWeek: number;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  date: Date;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ExerciseFilters {
  category?: string;
  muscleGroup?: string;
  createdByMe?: boolean;
}

export interface WorkoutHistoryFilters {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}
