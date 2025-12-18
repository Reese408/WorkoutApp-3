import pool from './db';
import {
  WorkoutExercise,
  WorkoutExerciseWithDetails,
  CreateWorkoutExerciseInput,
  UpdateWorkoutExerciseInput
} from '../models/WorkoutExercise';

/**
 * Get all exercises for a specific workout, ordered by order_index
 */
export async function getWorkoutExercises(workoutId: string): Promise<WorkoutExerciseWithDetails[]> {
  try {
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
       ORDER BY we.order_index ASC`,
      [workoutId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching workout exercises:', error);
    throw new Error('Failed to fetch workout exercises');
  }
}

/**
 * Get a single workout exercise by ID
 */
export async function getWorkoutExerciseById(id: string): Promise<WorkoutExercise | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM workout_exercises WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching workout exercise:', error);
    throw new Error('Failed to fetch workout exercise');
  }
}

/**
 * Add an exercise to a workout
 */
export async function createWorkoutExercise(
  input: CreateWorkoutExerciseInput
): Promise<WorkoutExercise> {
  try {
    const result = await pool.query(
      `INSERT INTO workout_exercises 
       (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.workout_id,
        input.exercise_id,
        input.order_index,
        input.target_sets,
        input.target_reps,
        input.rest_seconds || 60,
        input.notes || null
      ]
    );
    return result.rows[0];
  } catch (error: any) {
    console.error('Error creating workout exercise:', error);
    if (error.code === '23503') { // Foreign key violation
      throw new Error('Invalid workout or exercise ID');
    }
    throw new Error('Failed to add exercise to workout');
  }
}

/**
 * Update a workout exercise
 */
export async function updateWorkoutExercise(
  id: string,
  input: UpdateWorkoutExerciseInput
): Promise<WorkoutExercise | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.order_index !== undefined) {
      fields.push(`order_index = $${paramCount++}`);
      values.push(input.order_index);
    }
    if (input.target_sets !== undefined) {
      fields.push(`target_sets = $${paramCount++}`);
      values.push(input.target_sets);
    }
    if (input.target_reps !== undefined) {
      fields.push(`target_reps = $${paramCount++}`);
      values.push(input.target_reps);
    }
    if (input.rest_seconds !== undefined) {
      fields.push(`rest_seconds = $${paramCount++}`);
      values.push(input.rest_seconds);
    }
    if (input.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(input.notes);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE workout_exercises SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating workout exercise:', error);
    throw new Error('Failed to update workout exercise');
  }
}

/**
 * Delete a workout exercise
 */
export async function deleteWorkoutExercise(id: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'DELETE FROM workout_exercises WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting workout exercise:', error);
    throw new Error('Failed to delete workout exercise');
  }
}

/**
 * Reorder workout exercises (update multiple order_index values)
 */
export async function reorderWorkoutExercises(
  updates: { id: string; order_index: number }[]
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const update of updates) {
      await client.query(
        'UPDATE workout_exercises SET order_index = $1 WHERE id = $2',
        [update.order_index, update.id]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reordering workout exercises:', error);
    throw new Error('Failed to reorder workout exercises');
  } finally {
    client.release();
  }
}

/**
 * Get the next available order_index for a workout
 */
export async function getNextOrderIndex(workoutId: string): Promise<number> {
  try {
    const result = await pool.query(
      'SELECT COALESCE(MAX(order_index), -1) + 1 as next_index FROM workout_exercises WHERE workout_id = $1',
      [workoutId]
    );
    return result.rows[0].next_index;
  } catch (error) {
    console.error('Error getting next order index:', error);
    throw new Error('Failed to get next order index');
  }
}
