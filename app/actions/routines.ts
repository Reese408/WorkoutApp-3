"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  type ActionResponse,
  type CreateRoutineFormData,
  type RoutineWithDetails,
  createRoutineSchema,
} from "@/lib/types";

const prisma = new PrismaClient();

/**
 * Get all workout routines for the current user
 */
export async function getUserRoutines(includePublic = false): Promise<ActionResponse<RoutineWithDetails[]>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to view routines",
      };
    }

    const where: any = includePublic
      ? {
          OR: [
            { createdBy: session.user.id },
            { isPublic: true },
          ],
        }
      : { createdBy: session.user.id };

    const routines = await prisma.workoutRoutine.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        _count: {
          select: {
            workoutLogs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: routines,
    };
  } catch (error) {
    console.error("Failed to fetch routines:", error);
    return {
      success: false,
      error: "Failed to fetch routines",
    };
  }
}

/**
 * Get a single routine by ID with all exercises
 */
export async function getRoutine(id: string): Promise<ActionResponse<RoutineWithDetails>> {
  try {
    const routine = await prisma.workoutRoutine.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        _count: {
          select: {
            workoutLogs: true,
          },
        },
      },
    });

    if (!routine) {
      return {
        success: false,
        error: "Routine not found",
      };
    }

    return {
      success: true,
      data: routine,
    };
  } catch (error) {
    console.error("Failed to fetch routine:", error);
    return {
      success: false,
      error: "Failed to fetch routine",
    };
  }
}

/**
 * Create a new workout routine with exercises
 */
export async function createRoutine(data: CreateRoutineFormData): Promise<ActionResponse<RoutineWithDetails>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to create routines",
      };
    }

    // Validate data
    const validated = createRoutineSchema.parse(data);

    // Create routine with exercises in a transaction
    const routine = await prisma.$transaction(async (tx) => {
      // Create the routine
      const newRoutine = await tx.workoutRoutine.create({
        data: {
          name: validated.name,
          description: validated.description,
          isPublic: validated.isPublic,
          createdBy: session.user.id,
        },
      });

      // Create the workout exercises
      await tx.workoutExercise.createMany({
        data: validated.exercises.map((ex) => ({
          routineId: newRoutine.id,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          targetDuration: ex.targetDuration,
          restPeriod: ex.restPeriod,
          notes: ex.notes,
          supersetGroup: ex.supersetGroup,
        })),
      });

      // Fetch and return the complete routine
      return await tx.workoutRoutine.findUnique({
        where: { id: newRoutine.id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: {
              orderIndex: "asc",
            },
          },
          _count: {
            select: {
              workoutLogs: true,
            },
          },
        },
      });
    });

    revalidatePath("/routines");

    if (!routine) {
      return {
        success: false,
        error: "Failed to create routine",
      };
    }

    return {
      success: true,
      data: routine,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Failed to create routine:", error);
    return {
      success: false,
      error: "Failed to create routine",
    };
  }
}

/**
 * Update a workout routine
 */
export async function updateRoutine(
  id: string,
  data: CreateRoutineFormData
): Promise<ActionResponse<RoutineWithDetails>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to update routines",
      };
    }

    // Check if routine exists and user owns it
    const existingRoutine = await prisma.workoutRoutine.findUnique({
      where: { id },
    });

    if (!existingRoutine) {
      return {
        success: false,
        error: "Routine not found",
      };
    }

    if (existingRoutine.createdBy !== session.user.id) {
      return {
        success: false,
        error: "You can only update your own routines",
      };
    }

    // Validate data
    const validated = createRoutineSchema.parse(data);

    // Update routine with exercises in a transaction
    const routine = await prisma.$transaction(async (tx) => {
      // Update the routine
      await tx.workoutRoutine.update({
        where: { id },
        data: {
          name: validated.name,
          description: validated.description,
          isPublic: validated.isPublic,
        },
      });

      // Delete existing exercises
      await tx.workoutExercise.deleteMany({
        where: { routineId: id },
      });

      // Create new exercises
      await tx.workoutExercise.createMany({
        data: validated.exercises.map((ex) => ({
          routineId: id,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          targetDuration: ex.targetDuration,
          restPeriod: ex.restPeriod,
          notes: ex.notes,
          supersetGroup: ex.supersetGroup,
        })),
      });

      // Fetch and return the complete routine
      return await tx.workoutRoutine.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: {
              orderIndex: "asc",
            },
          },
          _count: {
            select: {
              workoutLogs: true,
            },
          },
        },
      });
    });

    revalidatePath("/routines");
    revalidatePath(`/routines/${id}`);

    if (!routine) {
      return {
        success: false,
        error: "Failed to update routine",
      };
    }

    return {
      success: true,
      data: routine,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Failed to update routine:", error);
    return {
      success: false,
      error: "Failed to update routine",
    };
  }
}

/**
 * Delete a workout routine
 */
export async function deleteRoutine(id: string): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to delete routines",
      };
    }

    // Check if routine exists and user owns it
    const existingRoutine = await prisma.workoutRoutine.findUnique({
      where: { id },
    });

    if (!existingRoutine) {
      return {
        success: false,
        error: "Routine not found",
      };
    }

    if (existingRoutine.createdBy !== session.user.id) {
      return {
        success: false,
        error: "You can only delete your own routines",
      };
    }

    // Delete routine (cascade will delete exercises)
    await prisma.workoutRoutine.delete({
      where: { id },
    });

    revalidatePath("/routines");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete routine:", error);
    return {
      success: false,
      error: "Failed to delete routine",
    };
  }
}

/**
 * Clone/duplicate a routine (create a copy)
 */
export async function cloneRoutine(id: string): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to clone routines",
      };
    }

    // Get the routine to clone
    const originalRoutine = await prisma.workoutRoutine.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (!originalRoutine) {
      return {
        success: false,
        error: "Routine not found",
      };
    }

    // Check if user can access this routine (either owner or public)
    if (originalRoutine.createdBy !== session.user.id && !originalRoutine.isPublic) {
      return {
        success: false,
        error: "You cannot clone private routines you don't own",
      };
    }

    // Create the cloned routine
    const clonedRoutine = await prisma.$transaction(async (tx) => {
      // Create new routine
      const newRoutine = await tx.workoutRoutine.create({
        data: {
          name: `${originalRoutine.name} (Copy)`,
          description: originalRoutine.description,
          isPublic: false, // Always make clones private initially
          createdBy: session.user.id,
        },
      });

      // Clone all exercises
      await tx.workoutExercise.createMany({
        data: originalRoutine.exercises.map((ex) => ({
          routineId: newRoutine.id,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          targetDuration: ex.targetDuration,
          restPeriod: ex.restPeriod,
          notes: ex.notes,
          supersetGroup: ex.supersetGroup,
        })),
      });

      return await tx.workoutRoutine.findUnique({
        where: { id: newRoutine.id },
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
      });
    });

    revalidatePath("/routines");

    return {
      success: true,
      data: clonedRoutine,
    };
  } catch (error) {
    console.error("Failed to clone routine:", error);
    return {
      success: false,
      error: "Failed to clone routine",
    };
  }
}
