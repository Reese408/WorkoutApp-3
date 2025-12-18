'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { 
  createExercise, 
  updateExercise, 
  deleteExercise 
} from './exercises';
import { 
  createWorkoutExercise,
  updateWorkoutExercise,
  deleteWorkoutExercise,
  reorderWorkoutExercises
} from './workout-exercises';
import {
  createWorkoutLog,
  updateWorkoutLog,
  completeWorkoutLog,
  deleteWorkoutLog
} from './workout-logs';
import {
  createSetLog,
  updateSetLog,
  deleteSetLog
} from './set-logs';
import type { CreateExerciseInput } from '../models/Exercise';
import type { CreateWorkoutExerciseInput, UpdateWorkoutExerciseInput } from '../models/WorkoutExercise';
import type { CreateWorkoutLogInput, UpdateWorkoutLogInput, CompleteWorkoutLogInput } from '../models/WorkoutLog';
import type { CreateSetLogInput } from '../models/SetLog';

// ============================================================================
// EXERCISE ACTIONS
// ============================================================================

export async function createExerciseAction(formData: FormData, userId: string) {
  try {
    const muscleGroupsStr = formData.get('muscle_groups') as string;
    const muscleGroups = muscleGroupsStr ? muscleGroupsStr.split(',').map(g => g.trim()) : [];

    const exerciseData: CreateExerciseInput = {
      name: formData.get('name') as string,
      category: formData.get('category') as string || undefined,
      muscle_groups: muscleGroups,
      equipment_needed: formData.get('equipment_needed') as string || undefined,
      instructions: formData.get('instructions') as string || undefined,
      demo_video_url: formData.get('demo_video_url') as string || undefined,
    };

    const exercise = await createExercise(exerciseData, userId);
    revalidatePath('/exercises');
    return { success: true, exercise };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateExerciseAction(id: string, formData: FormData, userId: string) {
  try {
    const muscleGroupsStr = formData.get('muscle_groups') as string;
    const muscleGroups = muscleGroupsStr ? muscleGroupsStr.split(',').map(g => g.trim()) : undefined;

    const exerciseData = {
      name: formData.get('name') as string || undefined,
      category: formData.get('category') as string || undefined,
      muscle_groups: muscleGroups,
      equipment_needed: formData.get('equipment_needed') as string || undefined,
      instructions: formData.get('instructions') as string || undefined,
      demo_video_url: formData.get('demo_video_url') as string || undefined,
    };

    const exercise = await updateExercise(id, exerciseData, userId);
    revalidatePath('/exercises');
    revalidatePath(`/exercises/${id}`);
    return { success: true, exercise };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExerciseAction(id: string, userId: string) {
  try {
    await deleteExercise(id, userId);
    revalidatePath('/exercises');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// WORKOUT EXERCISE ACTIONS
// ============================================================================

export async function addExerciseToWorkoutAction(data: CreateWorkoutExerciseInput) {
  try {
    const workoutExercise = await createWorkoutExercise(data);
    revalidatePath(`/workouts/${data.workout_id}/builder`);
    return { success: true, workoutExercise };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWorkoutExerciseAction(id: string, data: UpdateWorkoutExerciseInput) {
  try {
    const workoutExercise = await updateWorkoutExercise(id, data);
    revalidatePath('/workouts');
    return { success: true, workoutExercise };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeExerciseFromWorkoutAction(id: string, workoutId: string) {
  try {
    await deleteWorkoutExercise(id);
    revalidatePath(`/workouts/${workoutId}/builder`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reorderWorkoutExercisesAction(
  updates: { id: string; order_index: number }[],
  workoutId: string
) {
  try {
    await reorderWorkoutExercises(updates);
    revalidatePath(`/workouts/${workoutId}/builder`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// WORKOUT LOG ACTIONS
// ============================================================================

export async function startWorkoutAction(data: CreateWorkoutLogInput) {
  try {
    const workoutLog = await createWorkoutLog(data);
    revalidatePath('/workouts/history');
    redirect(`/workouts/${data.workout_id}/play/${workoutLog.id}`);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWorkoutLogAction(id: string, data: UpdateWorkoutLogInput) {
  try {
    const workoutLog = await updateWorkoutLog(id, data);
    revalidatePath('/workouts/history');
    revalidatePath(`/workouts/play/${id}`);
    return { success: true, workoutLog };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completeWorkoutAction(id: string, data: CompleteWorkoutLogInput) {
  try {
    const workoutLog = await completeWorkoutLog(id, data);
    revalidatePath('/workouts/history');
    return { success: true, workoutLog };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteWorkoutLogAction(id: string) {
  try {
    await deleteWorkoutLog(id);
    revalidatePath('/workouts/history');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// SET LOG ACTIONS
// ============================================================================

export async function logSetAction(data: CreateSetLogInput) {
  try {
    const setLog = await createSetLog(data);
    revalidatePath(`/workouts/play/${data.workout_log_id}`);
    return { success: true, setLog };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSetLogAction(id: string, data: UpdateSetLogInput) {
  try {
    const setLog = await updateSetLog(id, data);
    revalidatePath('/workouts/play');
    return { success: true, setLog };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSetLogAction(id: string, workoutLogId: string) {
  try {
    await deleteSetLog(id);
    revalidatePath(`/workouts/play/${workoutLogId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
