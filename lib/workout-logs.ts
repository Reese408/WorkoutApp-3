import pool from './db';
import {
  WorkoutLog,
  WorkoutLogWithDetails,
  CreateWorkoutLogInput,
  UpdateWorkoutLogInput,
  CompleteWorkoutLogInput
} from '../models/WorkoutLog';

/**
 * Get all workout logs with optional filters
 */
export async function getWorkoutLogs(
  userIdentifier?: string,
  limit: number = 50,
  offset: number = 0
): Promise<WorkoutLogWithDetails[]> {
  try {
    let query = `
      SELECT 
        wl.*,
        w.title as workout_title,
        w.slug as workout_slug,
        w.image_key as workout_image_key
      FROM workout_logs wl
      JOIN workouts w ON wl.workout_id = w.id
    `;
    const params: any[] = [];

    if (userIdentifier) {
      query += ' WHERE wl.user_identifier = $1';
      params.push(userIdentifier);
      query += ' ORDER BY wl.started_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      query += ' ORDER BY wl.started_at DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    throw new Error('Failed to fetch workout logs');
  }
}

/**
 * Get a single workout log by ID with details
 */
export async function getWorkoutLogById(id: string): Promise<WorkoutLogWithDetails | null> {
  try {
    const result = await pool.query(
      `SELECT 
        wl.*,
        w.title as workout_title,
        w.slug as workout_slug,
        w.image_key as workout_image_key
       FROM workout_logs wl
       JOIN workouts w ON wl.workout_id = w.id
       WHERE wl.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching workout log:', error);
    throw new Error('Failed to fetch workout log');
  }
}

/**
 * Get workout logs by date range
 */
export async function getWorkoutLogsByDateRange(
  startDate: Date,
  endDate: Date,
  userIdentifier?: string
): Promise<WorkoutLogWithDetails[]> {
  try {
    let query = `
      SELECT 
        wl.*,
        w.title as workout_title,
        w.slug as workout_slug,
        w.image_key as workout_image_key
      FROM workout_logs wl
      JOIN workouts w ON wl.workout_id = w.id
      WHERE wl.started_at >= $1 AND wl.started_at <= $2
    `;
    const params: any[] = [startDate, endDate];

    if (userIdentifier) {
      query += ' AND wl.user_identifier = $3';
      params.push(userIdentifier);
    }

    query += ' ORDER BY wl.started_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching workout logs by date range:', error);
    throw new Error('Failed to fetch workout logs by date range');
  }
}

/**
 * Create a new workout log (start a workout)
 */
export async function createWorkoutLog(input: CreateWorkoutLogInput): Promise<WorkoutLog> {
  try {
    const result = await pool.query(
      `INSERT INTO workout_logs (workout_id, user_identifier, started_at, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        input.workout_id,
        input.user_identifier || null,
        input.started_at,
        input.notes || null
      ]
    );
    return result.rows[0];
  } catch (error: any) {
    console.error('Error creating workout log:', error);
    if (error.code === '23503') {
      throw new Error('Invalid workout ID');
    }
    throw new Error('Failed to create workout log');
  }
}

/**
 * Update a workout log
 */
export async function updateWorkoutLog(
  id: string,
  input: UpdateWorkoutLogInput
): Promise<WorkoutLog | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.completed_at !== undefined) {
      fields.push(`completed_at = $${paramCount++}`);
      values.push(input.completed_at);
    }
    if (input.duration_minutes !== undefined) {
      fields.push(`duration_minutes = $${paramCount++}`);
      values.push(input.duration_minutes);
    }
    if (input.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(input.notes);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE workout_logs SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating workout log:', error);
    throw new Error('Failed to update workout log');
  }
}

/**
 * Complete a workout log
 */
export async function completeWorkoutLog(
  id: string,
  input: CompleteWorkoutLogInput
): Promise<WorkoutLog | null> {
  try {
    const result = await pool.query(
      `UPDATE workout_logs 
       SET completed_at = $1, duration_minutes = $2
       WHERE id = $3
       RETURNING *`,
      [input.completed_at, input.duration_minutes, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error completing workout log:', error);
    throw new Error('Failed to complete workout log');
  }
}

/**
 * Delete a workout log
 */
export async function deleteWorkoutLog(id: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'DELETE FROM workout_logs WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting workout log:', error);
    throw new Error('Failed to delete workout log');
  }
}

/**
 * Get workout logs count for a user
 */
export async function getWorkoutLogsCount(userIdentifier?: string): Promise<number> {
  try {
    let query = 'SELECT COUNT(*) FROM workout_logs';
    const params: any[] = [];

    if (userIdentifier) {
      query += ' WHERE user_identifier = $1';
      params.push(userIdentifier);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error counting workout logs:', error);
    throw new Error('Failed to count workout logs');
  }
}

/**
 * Get completed workouts count for a user
 */
export async function getCompletedWorkoutsCount(userIdentifier?: string): Promise<number> {
  try {
    let query = 'SELECT COUNT(*) FROM workout_logs WHERE completed_at IS NOT NULL';
    const params: any[] = [];

    if (userIdentifier) {
      query += ' AND user_identifier = $1';
      params.push(userIdentifier);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error counting completed workouts:', error);
    throw new Error('Failed to count completed workouts');
  }
}
