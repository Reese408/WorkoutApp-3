import pool from './db';
import {
  SetLog,
  SetLogWithDetails,
  CreateSetLogInput,
  UpdateSetLogInput
} from '../models/SetLog';

/**
 * Get all set logs for a workout log
 */
export async function getSetLogsByWorkoutLog(workoutLogId: string): Promise<SetLogWithDetails[]> {
  try {
    const result = await pool.query(
      `SELECT 
        sl.*,
        e.name as exercise_name,
        e.category as exercise_category
       FROM set_logs sl
       JOIN exercises e ON sl.exercise_id = e.id
       WHERE sl.workout_log_id = $1
       ORDER BY sl.created_at ASC`,
      [workoutLogId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching set logs:', error);
    throw new Error('Failed to fetch set logs');
  }
}

/**
 * Get set logs for a specific exercise in a workout log
 */
export async function getSetLogsByExercise(
  workoutLogId: string,
  exerciseId: string
): Promise<SetLog[]> {
  try {
    const result = await pool.query(
      `SELECT * FROM set_logs 
       WHERE workout_log_id = $1 AND exercise_id = $2
       ORDER BY set_number ASC`,
      [workoutLogId, exerciseId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching set logs by exercise:', error);
    throw new Error('Failed to fetch set logs by exercise');
  }
}

/**
 * Get a single set log by ID
 */
export async function getSetLogById(id: string): Promise<SetLog | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM set_logs WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching set log:', error);
    throw new Error('Failed to fetch set log');
  }
}

/**
 * Create a new set log
 */
export async function createSetLog(input: CreateSetLogInput): Promise<SetLog> {
  try {
    const result = await pool.query(
      `INSERT INTO set_logs 
       (workout_log_id, exercise_id, set_number, reps_completed, weight_used, completed)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.workout_log_id,
        input.exercise_id,
        input.set_number,
        input.reps_completed,
        input.weight_used || null,
        input.completed !== undefined ? input.completed : true
      ]
    );
    return result.rows[0];
  } catch (error: any) {
    console.error('Error creating set log:', error);
    if (error.code === '23503') {
      throw new Error('Invalid workout log or exercise ID');
    }
    throw new Error('Failed to create set log');
  }
}

/**
 * Update a set log
 */
export async function updateSetLog(
  id: string,
  input: UpdateSetLogInput
): Promise<SetLog | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.reps_completed !== undefined) {
      fields.push(`reps_completed = $${paramCount++}`);
      values.push(input.reps_completed);
    }
    if (input.weight_used !== undefined) {
      fields.push(`weight_used = $${paramCount++}`);
      values.push(input.weight_used);
    }
    if (input.completed !== undefined) {
      fields.push(`completed = $${paramCount++}`);
      values.push(input.completed);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE set_logs SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating set log:', error);
    throw new Error('Failed to update set log');
  }
}

/**
 * Delete a set log
 */
export async function deleteSetLog(id: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'DELETE FROM set_logs WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting set log:', error);
    throw new Error('Failed to delete set log');
  }
}

/**
 * Get total sets completed for a workout log
 */
export async function getTotalSetsCompleted(workoutLogId: string): Promise<number> {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM set_logs WHERE workout_log_id = $1 AND completed = true',
      [workoutLogId]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error counting completed sets:', error);
    throw new Error('Failed to count completed sets');
  }
}

/**
 * Get total volume (weight * reps) for an exercise in a workout log
 */
export async function getTotalVolumeForExercise(
  workoutLogId: string,
  exerciseId: string
): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(weight_used * reps_completed), 0) as total_volume
       FROM set_logs 
       WHERE workout_log_id = $1 AND exercise_id = $2 AND completed = true`,
      [workoutLogId, exerciseId]
    );
    return parseFloat(result.rows[0].total_volume);
  } catch (error) {
    console.error('Error calculating total volume:', error);
    throw new Error('Failed to calculate total volume');
  }
}

/**
 * Get personal records (max weight) for an exercise by user
 */
export async function getPersonalRecordForExercise(
  exerciseId: string,
  userIdentifier?: string
): Promise<{ max_weight: number; reps: number; date: Date } | null> {
  try {
    let query = `
      SELECT sl.weight_used as max_weight, sl.reps_completed as reps, sl.created_at as date
      FROM set_logs sl
      JOIN workout_logs wl ON sl.workout_log_id = wl.id
      WHERE sl.exercise_id = $1 AND sl.completed = true
    `;
    const params: any[] = [exerciseId];

    if (userIdentifier) {
      query += ' AND wl.user_identifier = $2';
      params.push(userIdentifier);
    }

    query += ' ORDER BY sl.weight_used DESC, sl.reps_completed DESC LIMIT 1';

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching personal record:', error);
    throw new Error('Failed to fetch personal record');
  }
}
