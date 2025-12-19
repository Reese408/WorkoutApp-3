"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  type ActionResponse,
  type SetLogFormData,
  type StartWorkoutFormData,
  type CompleteWorkoutFormData,
  type WorkoutLogWithDetails,
  type WorkoutHistoryItem,
  type WorkoutStats,
  type PersonalRecord,
  type WorkoutSessionSummary,
  type ExerciseSummary,
  setLogSchema,
  startWorkoutSchema,
  completeWorkoutSchema,
} from "@/lib/types";

const prisma = new PrismaClient();

/**
 * Start a new workout session (or resume existing in-progress one)
 */
export async function startWorkout(data: StartWorkoutFormData): Promise<ActionResponse<WorkoutLogWithDetails>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to start a workout",
      };
    }

    const validated = startWorkoutSchema.parse(data);

    // Check for existing in-progress workout for this routine
    const existingWorkout = await prisma.workoutLog.findFirst({
      where: {
        userId: session.user.id,
        routineId: validated.routineId,
        endTime: null, // In progress
      },
      include: {
        routine: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        },
        setLogs: {
          include: {
            exercise: true,
          },
          orderBy: {
            timestamp: "asc",
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    // If found, return the existing workout to resume
    if (existingWorkout) {
      return {
        success: true,
        data: existingWorkout,
      };
    }

    // Otherwise create a new workout log
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId: session.user.id,
        routineId: validated.routineId,
        notes: validated.notes,
        startTime: new Date(),
      },
      include: {
        routine: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        },
        setLogs: {
          include: {
            exercise: true,
          },
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    revalidatePath("/workouts/history");

    return {
      success: true,
      data: workoutLog,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    console.error("Failed to start workout:", error);
    return {
      success: false,
      error: "Failed to start workout",
    };
  }
}

/**
 * Log a set during a workout
 */
export async function logSet(
  workoutId: string,
  setData: SetLogFormData
): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to log sets",
      };
    }

    // Verify the workout belongs to the user
    const workout = await prisma.workoutLog.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      return {
        success: false,
        error: "Workout not found",
      };
    }

    if (workout.userId !== session.user.id) {
      return {
        success: false,
        error: "You can only log sets for your own workouts",
      };
    }

    const validated = setLogSchema.parse(setData);

    const setLog = await prisma.setLog.create({
      data: {
        workoutId,
        exerciseId: validated.exerciseId,
        setNumber: validated.setNumber,
        reps: validated.reps,
        weight: validated.weight,
        duration: validated.duration,
        completed: validated.completed,
        notes: validated.notes,
      },
    });

    // Update personal record if applicable
    if (validated.weight && validated.reps) {
      await updatePersonalRecord(
        session.user.id,
        validated.exerciseId,
        validated.weight,
        validated.reps
      );
    }

    return {
      success: true,
      data: setLog,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    console.error("Failed to log set:", error);
    return {
      success: false,
      error: "Failed to log set",
    };
  }
}

/**
 * Complete a workout session
 */
export async function completeWorkout(
  data: CompleteWorkoutFormData
): Promise<ActionResponse<WorkoutLogWithDetails>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to complete workouts",
      };
    }

    const validated = completeWorkoutSchema.parse(data);

    // Verify the workout belongs to the user
    const existingWorkout = await prisma.workoutLog.findUnique({
      where: { id: validated.workoutId },
    });

    if (!existingWorkout) {
      return {
        success: false,
        error: "Workout not found",
      };
    }

    if (existingWorkout.userId !== session.user.id) {
      return {
        success: false,
        error: "You can only complete your own workouts",
      };
    }

    const endTime = validated.endTime || new Date();
    const totalDuration = Math.floor(
      (endTime.getTime() - existingWorkout.startTime.getTime()) / 1000 / 60
    ); // in minutes

    const workout = await prisma.workoutLog.update({
      where: { id: validated.workoutId },
      data: {
        endTime,
        totalDuration,
        notes: validated.notes || existingWorkout.notes,
      },
      include: {
        routine: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        },
        setLogs: {
          include: {
            exercise: true,
          },
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    revalidatePath("/workouts/history");
    revalidatePath(`/workouts/history/${validated.workoutId}`);

    return {
      success: true,
      data: workout,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    console.error("Failed to complete workout:", error);
    return {
      success: false,
      error: "Failed to complete workout",
    };
  }
}

/**
 * Get workout history for the current user
 */
export async function getWorkoutHistory(
  limit = 20,
  offset = 0
): Promise<ActionResponse<WorkoutHistoryItem[]>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to view workout history",
      };
    }

    const workouts = await prisma.workoutLog.findMany({
      where: {
        userId: session.user.id,
        endTime: { not: null }, // Only completed workouts
      },
      include: {
        routine: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            setLogs: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
      take: limit,
      skip: offset,
    });

    return {
      success: true,
      data: workouts,
    };
  } catch (error) {
    console.error("Failed to fetch workout history:", error);
    return {
      success: false,
      error: "Failed to fetch workout history",
    };
  }
}

/**
 * Get a single workout by ID with all sets
 */
export async function getWorkout(id: string): Promise<ActionResponse<WorkoutLogWithDetails>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const workout = await prisma.workoutLog.findUnique({
      where: { id },
      include: {
        routine: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        },
        setLogs: {
          include: {
            exercise: true,
          },
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    if (!workout) {
      return {
        success: false,
        error: "Workout not found",
      };
    }

    // Verify user owns this workout
    if (session && workout.userId !== session.user.id) {
      return {
        success: false,
        error: "You can only view your own workouts",
      };
    }

    return {
      success: true,
      data: workout,
    };
  } catch (error) {
    console.error("Failed to fetch workout:", error);
    return {
      success: false,
      error: "Failed to fetch workout",
    };
  }
}

/**
 * Delete a workout
 */
export async function deleteWorkout(id: string): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to delete workouts",
      };
    }

    // Verify the workout belongs to the user
    const workout = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!workout) {
      return {
        success: false,
        error: "Workout not found",
      };
    }

    if (workout.userId !== session.user.id) {
      return {
        success: false,
        error: "You can only delete your own workouts",
      };
    }

    // Delete workout (cascade will delete all sets)
    await prisma.workoutLog.delete({
      where: { id },
    });

    revalidatePath("/workouts/history");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete workout:", error);
    return {
      success: false,
      error: "Failed to delete workout",
    };
  }
}

/**
 * Get personal records for the current user
 */
export async function getPersonalRecords(): Promise<ActionResponse<any[]>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to view personal records",
      };
    }

    const records = await prisma.personalRecord.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error("Failed to fetch personal records:", error);
    return {
      success: false,
      error: "Failed to fetch personal records",
    };
  }
}

/**
 * Internal helper to update personal record
 */
async function updatePersonalRecord(
  userId: string,
  exerciseId: string,
  weight: number,
  reps: number
): Promise<void> {
  try {
    const existingRecord = await prisma.personalRecord.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    });

    // Calculate 1RM using Epley formula: weight * (1 + reps/30)
    const newOneRepMax = weight * (1 + reps / 30);
    const existingOneRepMax = existingRecord
      ? existingRecord.weight * (1 + existingRecord.reps / 30)
      : 0;

    // Update if new PR
    if (newOneRepMax > existingOneRepMax) {
      await prisma.personalRecord.upsert({
        where: {
          userId_exerciseId: {
            userId,
            exerciseId,
          },
        },
        update: {
          weight,
          reps,
          date: new Date(),
        },
        create: {
          userId,
          exerciseId,
          weight,
          reps,
        },
      });
    }
  } catch (error) {
    console.error("Failed to update personal record:", error);
    // Don't throw - PR update failure shouldn't break set logging
  }
}

/**
 * Get workout session summary for displaying completion stats
 */
export async function getWorkoutSessionSummary(
  sessionId: string
): Promise<ActionResponse<WorkoutSessionSummary>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Get the workout log with all details
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id: sessionId },
      include: {
        routine: {
          select: {
            id: true,
            name: true,
          },
        },
        setLogs: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    if (!workoutLog) {
      return {
        success: false,
        error: "Workout session not found",
      };
    }

    // Verify user owns this workout
    if (session && workoutLog.userId !== session.user.id) {
      return {
        success: false,
        error: "You can only view your own workouts",
      };
    }

    // Calculate summary statistics
    const totalSets = workoutLog.setLogs.length;
    const totalReps = workoutLog.setLogs.reduce((sum, set) => sum + (set.reps || 0), 0);
    const totalWeight = workoutLog.setLogs.reduce(
      (sum, set) => sum + (set.weight || 0) * (set.reps || 0),
      0
    );

    // Group by exercise and calculate exercise-level stats
    const exerciseMap = new Map<string, ExerciseSummary>();

    workoutLog.setLogs.forEach((set) => {
      const exerciseId = set.exerciseId;
      const exerciseName = set.exercise.name;

      if (!exerciseMap.has(exerciseId)) {
        exerciseMap.set(exerciseId, {
          exerciseId,
          exerciseName,
          sets: 0,
          totalReps: 0,
          totalWeight: 0,
          maxWeight: 0,
          avgWeight: 0,
          totalDuration: 0,
        });
      }

      const exerciseSummary = exerciseMap.get(exerciseId)!;
      exerciseSummary.sets += 1;
      exerciseSummary.totalReps += set.reps || 0;
      exerciseSummary.totalWeight += (set.weight || 0) * (set.reps || 0);
      exerciseSummary.maxWeight = Math.max(exerciseSummary.maxWeight, set.weight || 0);
      exerciseSummary.totalDuration += set.duration || 0;
    });

    // Calculate average weight for each exercise
    exerciseMap.forEach((summary) => {
      if (summary.sets > 0) {
        const totalWeightLifted = workoutLog.setLogs
          .filter((set) => set.exerciseId === summary.exerciseId && set.weight)
          .reduce((sum, set) => sum + (set.weight || 0), 0);
        const weightSetsCount = workoutLog.setLogs.filter(
          (set) => set.exerciseId === summary.exerciseId && set.weight
        ).length;
        summary.avgWeight = weightSetsCount > 0 ? totalWeightLifted / weightSetsCount : 0;
      }
    });

    const exerciseSummaries = Array.from(exerciseMap.values());

    // Calculate duration in minutes
    const duration =
      workoutLog.endTime && workoutLog.startTime
        ? Math.floor(
            (workoutLog.endTime.getTime() - workoutLog.startTime.getTime()) / 1000 / 60
          )
        : workoutLog.totalDuration || 0;

    // Calculate completion rate (if routine exists, compare planned vs completed sets)
    let completionRate = 100; // Default to 100% if no routine

    const summary: WorkoutSessionSummary = {
      workoutLog: {
        id: workoutLog.id,
        userId: workoutLog.userId,
        routineId: workoutLog.routineId,
        startTime: workoutLog.startTime,
        endTime: workoutLog.endTime,
        totalDuration: workoutLog.totalDuration,
        notes: workoutLog.notes,
        routine: workoutLog.routine
          ? {
              id: workoutLog.routine.id,
              name: workoutLog.routine.name,
              description: null,
              isPublic: false,
              createdBy: workoutLog.userId,
              createdAt: workoutLog.startTime,
              updatedAt: workoutLog.startTime,
            }
          : null,
      },
      totalSets,
      totalReps,
      totalWeight,
      exerciseSummaries,
      duration,
      completionRate,
    };

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error("Failed to get workout summary:", error);
    return {
      success: false,
      error: "Failed to get workout summary",
    };
  }
}

/**
 * Get personal records for specific exercises (for workout execution)
 */
export async function getExercisePRs(exerciseIds: string[]): Promise<ActionResponse<Record<string, { weight: number; reps: number; date: Date } | null>>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to view personal records",
      };
    }

    const records = await prisma.personalRecord.findMany({
      where: {
        userId: session.user.id,
        exerciseId: {
          in: exerciseIds,
        },
      },
      select: {
        exerciseId: true,
        weight: true,
        reps: true,
        date: true,
      },
    });

    // Convert array to map
    const prMap: Record<string, { weight: number; reps: number; date: Date } | null> = {};
    exerciseIds.forEach(id => {
      const pr = records.find(r => r.exerciseId === id);
      prMap[id] = pr || null;
    });

    return {
      success: true,
      data: prMap,
    };
  } catch (error) {
    console.error("Failed to fetch exercise PRs:", error);
    return {
      success: false,
      error: "Failed to fetch exercise PRs",
    };
  }
}

/**
 * Get workout stats/analytics for the current user
 */
export async function getWorkoutStats(): Promise<ActionResponse<WorkoutStats>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to view stats",
      };
    }

    const [
      totalWorkouts,
      allSets,
      recentWorkouts,
    ] = await Promise.all([
      prisma.workoutLog.count({
        where: {
          userId: session.user.id,
          endTime: { not: null },
        },
      }),

      // Get all sets to calculate total volume (weight * reps)
      prisma.setLog.findMany({
        where: {
          workout: {
            userId: session.user.id,
          },
        },
        select: {
          weight: true,
          reps: true,
        },
      }),

      prisma.workoutLog.findMany({
        where: {
          userId: session.user.id,
          endTime: { not: null },
          startTime: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          totalDuration: true,
        },
      }),
    ]);

    // Calculate total volume manually
    const totalVolume = allSets.reduce(
      (sum, set) => sum + (set.weight || 0) * (set.reps || 0),
      0
    );

    return {
      success: true,
      data: {
        totalWorkouts,
        totalSets: allSets.length,
        workoutsThisWeek: recentWorkouts.length,
        totalMinutesThisWeek: recentWorkouts.reduce(
          (sum, w) => sum + (w.totalDuration || 0),
          0
        ),
        totalVolume,
      },
    };
  } catch (error) {
    console.error("Failed to fetch workout stats:", error);
    return {
      success: false,
      error: "Failed to fetch workout stats",
    };
  }
}

