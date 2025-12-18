// src/lib/workout-routines.ts
import pool from './db';

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  is_shared: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutRoutineExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  target_sets: number;
  target_reps: number;
  rest_seconds: number;
  order_index: number;
}

export interface WorkoutRoutineWithExercises extends WorkoutRoutine {
  total_exercises: number;
  total_time: number;
  exercises: {
    id: string;
    exercise_id: string;
    exercise_name: string;
    sets: number;
    reps: number;
    time_minutes: number;
    order: number;
  }[];
  ownership_status?: 'owned' | 'shared';
  shared_by_email?: string;
}

/**
 * Get all workout routines for a user (owned + shared with them)
 */
export async function getWorkoutRoutines(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<WorkoutRoutineWithExercises[]> {
  const query = `
    SELECT
      wr.id,
      wr.name,
      wr.description,
      wr.is_public,
      wr.is_shared,
      wr.created_by,
      wr.created_at,
      wr.updated_at,
      COUNT(DISTINCT wre.id) AS total_exercises,
      COALESCE(SUM(wre.rest_seconds / 60), 0) AS total_time,
      json_agg(
        json_build_object(
          'id', wre.id,
          'exercise_id', wre.exercise_id,
          'exercise_name', e.name,
          'sets', wre.target_sets,
          'reps', wre.target_reps,
          'time_minutes', COALESCE(wre.rest_seconds / 60, 1),
          'order', wre.order_index
        ) ORDER BY wre.order_index
      ) FILTER (WHERE wre.id IS NOT NULL) AS exercises,
      CASE 
        WHEN wr.created_by = $1 THEN 'owned'
        ELSE 'shared'
      END AS ownership_status,
      CASE
        WHEN wr.created_by != $1 THEN u.email
        ELSE NULL
      END AS shared_by_email
    FROM workout_routines wr
    LEFT JOIN workout_exercises wre ON wr.id = wre.workout_id
    LEFT JOIN exercises e ON wre.exercise_id = e.id
    LEFT JOIN users u ON wr.created_by = u.id
    WHERE 
      wr.created_by = $1
      OR wr.id IN (
        SELECT workout_id 
        FROM workout_routine_shares 
        WHERE shared_with_user_id = $1
      )
    GROUP BY
      wr.id, wr.name, wr.description, wr.is_public, wr.is_shared, 
      wr.created_by, wr.created_at, wr.updated_at, u.email
    ORDER BY wr.updated_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [userId, limit, offset]);

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    is_public: row.is_public,
    is_shared: row.is_shared,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    total_exercises: Number(row.total_exercises) || 0,
    total_time: Number(row.total_time) || 0,
    exercises: row.exercises || [],
    ownership_status: row.ownership_status,
    shared_by_email: row.shared_by_email,
  }));
}

/**
 * Get a single workout routine by ID
 */
export async function getWorkoutRoutineById(
  routineId: string,
  userId: string
): Promise<WorkoutRoutineWithExercises | null> {
  // First check if user has access
  const accessCheck = await pool.query(
    `SELECT wr.id 
     FROM workout_routines wr
     LEFT JOIN workout_routine_shares wrs ON wr.id = wrs.workout_id
     WHERE wr.id = $1 
     AND (wr.created_by = $2 OR wrs.shared_with_user_id = $2)`,
    [routineId, userId]
  );

  if (accessCheck.rows.length === 0) {
    return null;
  }

  const query = `
    SELECT 
      wr.id,
      wr.name,
      wr.description,
      wr.is_public,
      wr.is_shared,
      wr.created_by,
      wr.created_at,
      wr.updated_at,
      json_agg(
        json_build_object(
          'id', wre.id,
          'exercise_id', e.id,
          'exercise_name', e.name,
          'sets', wre.target_sets,
          'reps', wre.target_reps,
          'time_minutes', COALESCE(wre.rest_seconds / 60, 1),
          'order', wre.order_index
        ) ORDER BY wre.order_index
      ) FILTER (WHERE wre.id IS NOT NULL) as exercises
    FROM workout_routines wr
    LEFT JOIN workout_exercises wre ON wr.id = wre.workout_id
    LEFT JOIN exercises e ON wre.exercise_id = e.id
    WHERE wr.id = $1
    GROUP BY wr.id
  `;

  const result = await pool.query(query, [routineId]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const exercises = row.exercises || [];
  
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    is_public: row.is_public,
    is_shared: row.is_shared,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    total_exercises: exercises.length,
    total_time: exercises.reduce((sum: number, ex: any) => sum + (ex.time_minutes || 0), 0),
    exercises: exercises,
  };
}

/**
 * Create a new workout routine
 */
export async function createWorkoutRoutine(data: {
  name: string;
  description?: string;
  is_public?: boolean;
  created_by: string;
  exercises: {
    exercise_id: string;
    sets: number;
    reps: number;
    time_minutes: number;
    order: number;
  }[];
}): Promise<WorkoutRoutineWithExercises> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert the workout routine
    const routineResult = await client.query(
      `INSERT INTO workout_routines (name, description, is_public, created_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, description, is_public, is_shared, created_by, created_at, updated_at`,
      [
        data.name.trim(),
        data.description?.trim() || '',
        data.is_public || false,
        data.created_by,
      ]
    );

    const routine = routineResult.rows[0];

    // Insert routine exercises
    const exercises = [];
    for (const exercise of data.exercises) {
      const exerciseResult = await client.query(
        `INSERT INTO workout_exercises (
          id,
          workout_id, 
          exercise_id, 
          target_sets, 
          target_reps, 
          rest_seconds, 
          order_index
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
        RETURNING id, workout_id, exercise_id, target_sets, target_reps, rest_seconds, order_index`,
        [
          routine.id,
          exercise.exercise_id,
          exercise.sets,
          exercise.reps,
          exercise.time_minutes * 60, // Convert minutes to seconds
          exercise.order,
        ]
      );

      // Get exercise name
      const exerciseNameResult = await client.query(
        'SELECT name FROM exercises WHERE id = $1',
        [exercise.exercise_id]
      );

      exercises.push({
        id: exerciseResult.rows[0].id,
        exercise_id: exerciseResult.rows[0].exercise_id,
        exercise_name: exerciseNameResult.rows[0].name,
        sets: exerciseResult.rows[0].target_sets,
        reps: exerciseResult.rows[0].target_reps,
        time_minutes: exerciseResult.rows[0].rest_seconds / 60,
        order: exerciseResult.rows[0].order_index,
      });
    }

    await client.query('COMMIT');

    return {
      ...routine,
      total_exercises: exercises.length,
      total_time: exercises.reduce((sum, ex) => sum + ex.time_minutes, 0),
      exercises,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update an existing workout routine
 */
export async function updateWorkoutRoutine(
  routineId: string,
  userId: string,
  data: {
    name: string;
    description?: string;
    is_public?: boolean;
    exercises: {
      exercise_id: string;
      sets: number;
      reps: number;
      time_minutes: number;
      order: number;
    }[];
  }
): Promise<WorkoutRoutineWithExercises | null> {
  // Check ownership
  const ownerCheck = await pool.query(
    'SELECT created_by FROM workout_routines WHERE id = $1',
    [routineId]
  );

  if (ownerCheck.rows.length === 0) {
    return null;
  }

  if (ownerCheck.rows[0].created_by !== userId) {
    throw new Error('Access denied: You can only update your own workout routines');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update the routine
    await client.query(
      `UPDATE workout_routines 
       SET name = $1, description = $2, is_public = $3, updated_at = NOW() 
       WHERE id = $4`,
      [data.name.trim(), data.description?.trim() || '', data.is_public || false, routineId]
    );

    // Delete existing exercises
    await client.query('DELETE FROM workout_exercises WHERE workout_id = $1', [routineId]);

    // Insert new exercises
    for (const exercise of data.exercises) {
      await client.query(
        `INSERT INTO workout_exercises (
          id,
          workout_id, 
          exercise_id, 
          target_sets, 
          target_reps, 
          rest_seconds,
          order_index
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
        [
          routineId,
          exercise.exercise_id,
          exercise.sets,
          exercise.reps,
          exercise.time_minutes * 60, // Convert minutes to seconds
          exercise.order
        ]
      );
    }

    await client.query('COMMIT');

    // Fetch the updated routine
    const result = await getWorkoutRoutineById(routineId, userId);
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete a workout routine
 */
export async function deleteWorkoutRoutine(routineId: string, userId: string): Promise<boolean> {
  // Check ownership
  const ownerCheck = await pool.query(
    'SELECT created_by FROM workout_routines WHERE id = $1',
    [routineId]
  );

  if (ownerCheck.rows.length === 0) {
    return false;
  }

  if (ownerCheck.rows[0].created_by !== userId) {
    throw new Error('Access denied: You can only delete your own workout routines');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete routine exercises
    await client.query('DELETE FROM workout_exercises WHERE workout_id = $1', [routineId]);

    // Delete routine shares if any
    await client.query('DELETE FROM workout_routine_shares WHERE workout_id = $1', [routineId]);

    // Delete the routine
    await client.query('DELETE FROM workout_routines WHERE id = $1', [routineId]);

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Share a workout routine with another user
 */
export async function shareWorkoutRoutine(
  routineId: string,
  ownerId: string,
  friendEmail: string
): Promise<void> {
  // Verify ownership
  const ownerCheck = await pool.query(
    'SELECT created_by FROM workout_routines WHERE id = $1',
    [routineId]
  );

  if (ownerCheck.rows.length === 0) {
    throw new Error('Workout routine not found');
  }

  if (ownerCheck.rows[0].created_by !== ownerId) {
    throw new Error('You can only share your own workout routines');
  }

  // Find friend by email
  const friendQuery = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [friendEmail]
  );

  if (friendQuery.rows.length === 0) {
    throw new Error('User not found with that email');
  }

  const friendId = friendQuery.rows[0].id;

  if (friendId === ownerId) {
    throw new Error('Cannot share workout routine with yourself');
  }

  // Check if already shared
  const existingShare = await pool.query(
    'SELECT id FROM workout_routine_shares WHERE workout_id = $1 AND shared_with_user_id = $2',
    [routineId, friendId]
  );

  if (existingShare.rows.length > 0) {
    throw new Error('Workout routine already shared with this user');
  }

  // Create the share
  await pool.query(
    `INSERT INTO workout_routine_shares (workout_id, shared_with_user_id, shared_by_user_id)
     VALUES ($1, $2, $3)`,
    [routineId, friendId, ownerId]
  );

  // Update routine to mark as shared
  await pool.query(
    'UPDATE workout_routines SET is_shared = true WHERE id = $1',
    [routineId]
  );
}