"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  type ActionResponse,
  type ExerciseFormData,
  type ExerciseWithCreator,
  type ExerciseFilters,
  exerciseSchema,
} from "@/lib/types";

const prisma = new PrismaClient();

/**
 * Get all exercises (with optional filtering)
 */
export async function getExercises(
  filters?: ExerciseFilters
): Promise<ActionResponse<ExerciseWithCreator[]>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const where: any = {};

    // Filter by category
    if (filters?.category) {
      where.category = filters.category;
    }

    // Filter by muscle group
    if (filters?.muscleGroup) {
      where.muscleGroups = {
        has: filters.muscleGroup,
      };
    }

    // Filter by creator
    if (filters?.createdByMe && session) {
      where.createdBy = session.user.id;
    } else {
      // If not filtering by creator, only show public exercises
      where.isPublic = true;
    }

    const exercises = await prisma.exercise.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: exercises,
    };
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
    return {
      success: false,
      error: "Failed to fetch exercises",
    };
  }
}

/**
 * Get a single exercise by ID
 */
export async function getExercise(id: string): Promise<ActionResponse<ExerciseWithCreator>> {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!exercise) {
      return {
        success: false,
        error: "Exercise not found",
      };
    }

    return {
      success: true,
      data: exercise,
    };
  } catch (error) {
    console.error("Failed to fetch exercise:", error);
    return {
      success: false,
      error: "Failed to fetch exercise",
    };
  }
}

/**
 * Create a new exercise
 */
export async function createExercise(
  formData: ExerciseFormData
): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to create exercises",
      };
    }

    // Validate data
    const validated = exerciseSchema.parse(formData);

    // Create exercise
    const exercise = await prisma.exercise.create({
      data: {
        ...validated,
        createdBy: session.user.id,
      },
    });

    revalidatePath("/exercises");

    return {
      success: true,
      data: exercise,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Failed to create exercise:", error);
    return {
      success: false,
      error: "Failed to create exercise",
    };
  }
}

/**
 * Update an exercise
 */
export async function updateExercise(
  id: string,
  formData: ExerciseFormData
): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to update exercises",
      };
    }

    // Check if exercise exists and user owns it
    const existingExercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existingExercise) {
      return {
        success: false,
        error: "Exercise not found",
      };
    }

    if (existingExercise.createdBy !== session.user.id) {
      return {
        success: false,
        error: "You can only update your own exercises",
      };
    }

    // Validate data
    const validated = exerciseSchema.parse(formData);

    // Update exercise
    const exercise = await prisma.exercise.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/exercises");
    revalidatePath(`/exercises/${id}`);

    return {
      success: true,
      data: exercise,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Failed to update exercise:", error);
    return {
      success: false,
      error: "Failed to update exercise",
    };
  }
}

/**
 * Delete an exercise
 */
export async function deleteExercise(id: string): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to delete exercises",
      };
    }

    // Check if exercise exists and user owns it
    const existingExercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existingExercise) {
      return {
        success: false,
        error: "Exercise not found",
      };
    }

    if (existingExercise.createdBy !== session.user.id) {
      return {
        success: false,
        error: "You can only delete your own exercises",
      };
    }

    // Delete exercise
    await prisma.exercise.delete({
      where: { id },
    });

    revalidatePath("/exercises");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete exercise:", error);
    return {
      success: false,
      error: "Failed to delete exercise",
    };
  }
}

/**
 * Get all unique categories from exercises
 */
export async function getExerciseCategories(): Promise<ActionResponse> {
  try {
    const exercises = await prisma.exercise.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    const categories = exercises.map((e) => e.category);

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
    };
  }
}

/**
 * Get all unique muscle groups from exercises
 */
export async function getMuscleGroups(): Promise<ActionResponse> {
  try {
    const exercises = await prisma.exercise.findMany({
      select: {
        muscleGroups: true,
      },
    });

    const muscleGroupsSet = new Set<string>();
    exercises.forEach((e) => {
      e.muscleGroups.forEach((mg) => muscleGroupsSet.add(mg));
    });

    const muscleGroups = Array.from(muscleGroupsSet).sort();

    return {
      success: true,
      data: muscleGroups,
    };
  } catch (error) {
    console.error("Failed to fetch muscle groups:", error);
    return {
      success: false,
      error: "Failed to fetch muscle groups",
    };
  }
}
