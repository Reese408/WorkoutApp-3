// lib/workoutExecutionService.ts
// Service layer for workout execution - adapted to YOUR schema

import pool from './db';

// Import each model separately from your models directory
import { WorkoutLog } from '@/models/WorkoutLog';
import { SetLog } from '@/models/SetLog';
import { WorkoutExerciseWithDetails } from '@/models/WorkoutExercise';
import { SupersetGroup } from '@/models/workout-execution';

/**
 * Start a new workout session (creates workout_log)
 */
export async function startWorkoutExecution(
  workoutId: string,
  userIdentifier?: string
): Promise<WorkoutLog> {
  const result = await pool.query(
    `INSERT INTO workout_logs (
      id,
      workout_id, 
      user_identifier, 
      started_at, 
      status
    )
    VALUES (gen_random_uuid(), $1, $2, NOW(), 'in_progress')
    RETURNING *`,
    [workoutId, userIdentifier || null]
  );
  
  return result.rows[0];
}

/**
 * Get workout exercises with full details (for execution)
 */
export async function getWorkoutExercisesForExecution(
  workoutId: string
): Promise<WorkoutExerciseWithDetails[]> {
  const result = await pool.query(
    `SELECT 
      we.*,
      e.name as exercise_name,
      e.category as exercise_category,
      e.muscle_groups as exercise_muscle_groups,
      e.equipment_needed as exercise_equipment_needed,
      e.instructions as exercise_instructions,
      e.demo_video_url as exercise_demo_video_url
     FROM workout_exercises we
     JOIN exercises e ON we.exercise_id = e.id
     WHERE we.workout_id = $1
     ORDER BY 
       COALESCE(we.superset_group, 999999), -- Group supersets together
       we.order_index`,
    [workoutId]
  );
  
  return result.rows;
}

/**
 * Organize exercises into superset groups
 */
export function organizeIntoSupersets(
  exercises: WorkoutExerciseWithDetails[]
): { regular: WorkoutExerciseWithDetails[], supersets: SupersetGroup[] } {
  const regular: WorkoutExerciseWithDetails[] = [];
  const supersetMap = new Map<number, WorkoutExerciseWithDetails[]>();
  
  exercises.forEach(exercise => {
    if (
      exercise.is_superset &&
      exercise.superset_group !== null &&
      exercise.superset_group !== undefined
    ) {
      const group = supersetMap.get(exercise.superset_group as number) || [];
      group.push(exercise);
      supersetMap.set(exercise.superset_group as number, group);
    } else {
      regular.push(exercise);
    }
  });
  
  const supersets: SupersetGroup[] = Array.from(supersetMap.entries()).map(
    ([group_number, exercises]) => ({
      group_number,
      exercises,
      total_sets: exercises[0]?.target_sets || 0
    })
  );
  
  return { regular, supersets };
}

/**
 * Log a completed set
 */
export async function logSet(
  workoutLogId: string,
  exerciseId: string,
  setNumber: number,
  supersetPosition: number,
  setData: {
    reps: number;
    weight?: number | null;
    rpe?: number | null;
    notes?: string | null;
  }
): Promise<SetLog> {
  const result = await pool.query(
    `INSERT INTO set_logs (
      id,
      workout_log_id,
      exercise_id,
      set_number,
      reps_completed,           -- ← Changed from 'reps'
      weight_used,              -- ← Changed from 'weight'
      superset_position,
      rpe,
      notes,
      completed_at,
      completed                 -- ← Add this field
    ) VALUES (
      gen_random_uuid(),
      $1, $2, $3, $4, $5, $6, $7, $8, NOW(), true
    )
    RETURNING *`,
    [
      workoutLogId,
      exerciseId,
      setNumber,
      setData.reps,
      setData.weight || null,
      supersetPosition,
      setData.rpe || null,
      setData.notes || null
    ]
  );
  
  // Update workout log totals
  await updateWorkoutLogTotals(workoutLogId);
  
  return result.rows[0];
}

/**
 * Get all set logs for a workout
 */
export async function getSetLogsForWorkout(
  workoutLogId: string
): Promise<SetLog[]> {
  const result = await pool.query(
    `SELECT * FROM set_logs
     WHERE workout_log_id = $1
     ORDER BY completed_at`,
    [workoutLogId]
  );
  
  return result.rows;
}

/**
 * Update workout log totals (volume, sets completed)
 */
async function updateWorkoutLogTotals(workoutLogId: string): Promise<void> {
  await pool.query(
    `UPDATE workout_logs
     SET 
       total_sets_completed = (
         SELECT COUNT(*) 
         FROM set_logs 
         WHERE workout_log_id = $1
       ),
       total_volume = (
         SELECT COALESCE(SUM(reps_completed * COALESCE(weight_used, 0)), 0)  -- ← Updated column names
         FROM set_logs 
         WHERE workout_log_id = $1
       )
     WHERE id = $1`,
    [workoutLogId]
  );
}

/**
 * Complete a workout
 */
export async function completeWorkout(
  workoutLogId: string,
  notes?: string
): Promise<WorkoutLog> {
  // Calculate duration
  const workoutLog = await pool.query(
    `SELECT started_at FROM workout_logs WHERE id = $1`,
    [workoutLogId]
  );
  
  const startTime = new Date(workoutLog.rows[0].started_at);
  const endTime = new Date();
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
  
  const result = await pool.query(
    `UPDATE workout_logs
     SET 
       status = 'completed',
       completed_at = NOW(),
       duration_minutes = $2,
       notes = COALESCE($3, notes)
     WHERE id = $1
     RETURNING *`,
    [workoutLogId, durationMinutes, notes]
  );
  
  return result.rows[0];
}

/**
 * Abandon a workout
 */
export async function abandonWorkout(workoutLogId: string): Promise<void> {
  await pool.query(
    `UPDATE workout_logs
     SET status = 'abandoned'
     WHERE id = $1`,
    [workoutLogId]
  );
}

/**
 * Get active workout for user
 */
export async function getActiveWorkout(
  userIdentifier: string
): Promise<WorkoutLog | null> {
  const result = await pool.query(
    `SELECT * FROM workout_logs
     WHERE user_identifier = $1 
       AND status = 'in_progress'
     ORDER BY started_at DESC
     LIMIT 1`,
    [userIdentifier]
  );
  
  return result.rows[0] || null;
}

/**
 * Get workout history for user
 */
export async function getWorkoutHistory(
  userIdentifier: string,
  limit: number = 10
): Promise<WorkoutLog[]> {
  const result = await pool.query(
    `SELECT wl.*, w.title as workout_title
     FROM workout_logs wl
     JOIN workouts w ON wl.workout_id = w.id
     WHERE wl.user_identifier = $1 
       AND wl.status = 'completed'
     ORDER BY wl.completed_at DESC
     LIMIT $2`,
    [userIdentifier, limit]
  );
  
  return result.rows;
}

/**
 * Check if a set has been completed
 */
export function isSetCompleted(
  completedSets: SetLog[],
  exerciseId: string,
  setNumber: number,
  supersetPosition: number = 1
): boolean {
  return completedSets.some(
    set => 
      set.exercise_id === exerciseId &&
      set.set_number === setNumber &&
      (set.superset_position || 1) === supersetPosition
  );
}

/**
 * Calculate workout progress
 */
export function calculateWorkoutProgress(
  exercises: WorkoutExerciseWithDetails[],
  completedSets: SetLog[]
): { completed: number; total: number; percentage: number } {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.target_sets, 0);
  const completed = completedSets.length;
  const percentage = totalSets > 0 ? Math.round((completed / totalSets) * 100) : 0;
  
  return { completed, total: totalSets, percentage };
}

/**
 * Get workout summary
 */
export async function getWorkoutSummary(
  workoutLogId: string,
  userIdentifier?: string
) {
  // Get workout log with workout details
  const workoutResult = await pool.query(
    `SELECT 
      wl.*,
      wr.name as workout_title,           -- ← Changed from w.title
      wr.name as workout_slug,            -- ← Changed from w.slug (routines don't have slug)
      NULL as workout_image_key           -- ← Routines don't have images
    FROM workout_logs wl
    JOIN workout_routines wr ON wl.workout_id = wr.id  -- ← Changed from 'workouts w'
    WHERE wl.id = $1 
    ${userIdentifier ? 'AND wl.user_identifier = $2' : ''}`,
    userIdentifier ? [workoutLogId, userIdentifier] : [workoutLogId]
  );

  if (workoutResult.rows.length === 0) {
    throw new Error('Workout log not found');
  }

  const workoutLog = workoutResult.rows[0];

  // Get all set logs with exercise details
  const setsResult = await pool.query(
    `SELECT 
      sl.id,
      sl.workout_log_id,
      sl.exercise_id,
      sl.set_number,
      sl.reps_completed as reps,        -- ← Add aliases
      sl.weight_used as weight,         -- ← Add aliases
      sl.superset_position,
      sl.rpe,
      sl.notes,
      sl.completed_at,
      e.name as exercise_name,
      e.category as exercise_category
    FROM set_logs sl
    JOIN exercises e ON sl.exercise_id = e.id
    WHERE sl.workout_log_id = $1
    ORDER BY sl.completed_at`,
    [workoutLogId]
  );

  return {
    workout_log: workoutLog,
    set_logs: setsResult.rows,
    duration_minutes: workoutLog.duration_minutes || 0
  };
}

export function calculateSmartRest(
  exerciseMinutes: number,
  sets: number,
  isSuperset: boolean = false,
  supersetExerciseCount: number = 1
): number {
  // Average time to complete one set (work time)
  const avgWorkTimePerSet = 45; // seconds
  
  // Convert minutes to seconds
  const totalSeconds = exerciseMinutes * 60;
  
  // Calculate total work time
  // For supersets: multiply by number of exercises in the group
  const exerciseCount = isSuperset ? supersetExerciseCount : 1;
  const totalWorkTime = sets * exerciseCount * avgWorkTimePerSet;
  
  // Calculate available time for rest
  const availableForRest = totalSeconds - totalWorkTime;
  
  // Number of rest periods (between sets, not after the last one)
  const restPeriods = sets - 1;
  
  // If only 1 set, return default 60 seconds
  if (restPeriods <= 0) return 60;
  
  // Calculate rest per period
  const calculatedRest = Math.floor(availableForRest / restPeriods);
  
  // Clamp between 30 seconds (minimum) and 5 minutes (maximum)
  // Even if math says you can rest longer, cap it at 5 min for workout flow
  const clampedRest = Math.max(30, Math.min(300, calculatedRest));
  
  return clampedRest;
}

/**
 * Calculate total time for a superset group
 * Combines time from all exercises in the group
 */
export function calculateSupersetTime(exercises: any[]): number {
  return exercises.reduce((total, ex) => total + (ex.time_minutes || 5), 0);
}

/**
 * Calculate total workout time from all exercises
 */
export function calculateTotalWorkoutTime(exercises: any[]): number {
  // Group by superset
  const supersetGroups = new Map<number, any[]>();
  const regularExercises: any[] = [];
  
  exercises.forEach(ex => {
    if (ex.is_superset && ex.superset_group !== null) {
      const group = supersetGroups.get(ex.superset_group) || [];
      group.push(ex);
      supersetGroups.set(ex.superset_group, group);
    } else {
      regularExercises.push(ex);
    }
  });
  
  // Calculate time for regular exercises
  const regularTime = regularExercises.reduce((sum, ex) => sum + (ex.time_minutes || 5), 0);
  
  // Calculate time for superset groups (each group counted once)
  let supersetTime = 0;
  const processedGroups = new Set<number>();
  
  supersetGroups.forEach((group, groupNumber) => {
    if (!processedGroups.has(groupNumber)) {
      supersetTime += calculateSupersetTime(group);
      processedGroups.add(groupNumber);
    }
  });
  
  return (regularTime + supersetTime) * 60; // Convert to seconds
}
