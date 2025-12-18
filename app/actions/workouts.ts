"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schemas
const setLogSchema = z.object({
  exerciseId: z.string(),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  duration: z.number().int().min(0).optional(),
  completed: z.boolean().default(true),
  notes: z.string().optional(),
});

const startWorkoutSchema = z.object({
  routineId: z.string().optional(),
  notes: z.string().optional(),
});

const completeWorkoutSchema = z.object({
  workoutId: z.string(),
  endTime: z.date().optional(),
  notes: z.string().optional(),
});

type SetLogData = z.infer<typeof setLogSchema>;
type StartWorkoutData = z.infer<typeof startWorkoutSchema>;
type CompleteWorkoutData = z.infer<typeof completeWorkoutSchema>;

type ActionResponse = {
  success: boolean;
  error?: string;
  data?: any;
};

/**
 * Start a new workout session
 */
export async function startWorkout(data: StartWorkoutData): Promise<ActionResponse> {
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
        error: error.errors[0].message,
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
  setData: SetLogData
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
        error: error.errors[0].message,
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
  data: CompleteWorkoutData
): Promise<ActionResponse> {
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
        routine: true,
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
        error: error.errors[0].message,
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
): Promise<ActionResponse> {
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
export async function getWorkout(id: string): Promise<ActionResponse> {
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
export async function getPersonalRecords(): Promise<ActionResponse> {
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
 * Get workout stats/analytics for the current user
 */
export async function getWorkoutStats(): Promise<ActionResponse> {
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

    const [totalWorkouts, totalSets, recentWorkouts] = await Promise.all([
      // Total completed workouts
      prisma.workoutLog.count({
        where: {
          userId: session.user.id,
          endTime: { not: null },
        },
      }),

      // Total sets logged
      prisma.setLog.count({
        where: {
          workout: {
            userId: session.user.id,
          },
        },
      }),

      // Last 7 days of workouts
      prisma.workoutLog.findMany({
        where: {
          userId: session.user.id,
          endTime: { not: null },
          startTime: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          startTime: true,
          totalDuration: true,
        },
      }),
    ]);

    const stats = {
      totalWorkouts,
      totalSets,
      workoutsThisWeek: recentWorkouts.length,
      totalMinutesThisWeek: recentWorkouts.reduce(
        (sum, w) => sum + (w.totalDuration || 0),
        0
      ),
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Failed to fetch workout stats:", error);
    return {
      success: false,
      error: "Failed to fetch workout stats",
    };
  }
}
