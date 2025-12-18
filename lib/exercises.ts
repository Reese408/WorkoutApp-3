import pool from './db';
import { Exercise, CreateExerciseInput, UpdateExerciseInput } from '../models/Exercise';

/**
 * Get all exercises with optional pagination and category filter
 * NOTE: This returns ALL exercises - use getExercisesForUser for visibility filtering
 */
export async function getExercises(
  limit: number = 50,
  offset: number = 0,
  category?: string
): Promise<Exercise[]> {
  try {
    let query = 'SELECT * FROM exercises';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
      query += ' ORDER BY name ASC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      query += ' ORDER BY name ASC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw new Error('Failed to fetch exercises');
  }
}

/**
 * 🎓 NEW: Get exercises visible to a specific user
 * Returns:
 * - All admin exercises (is_public = true)
 * - User's own exercises (created_by = userId)
 * - Future: Shared exercises (is_shared = true)
 */
export async function getExercisesForUser(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  category?: string
): Promise<Exercise[]> {
  try {
    let query = `
      SELECT 
        e.*,
        u.username as creator_name,
        CASE 
          WHEN e.created_by IS NULL AND e.is_public = true THEN 'admin'
          WHEN e.created_by = $1 THEN 'mine'
          WHEN e.is_shared = true THEN 'shared'
          ELSE 'admin'
        END as source
      FROM exercises e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 
        e.is_public = true              -- Admin exercises
        OR e.created_by = $1            -- User's own exercises
        -- OR e.is_shared = true        -- Future: Community shared
    `;
    
    const params: any[] = [userId];
    let paramCount = 2;

    if (category) {
      query += ` AND e.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    query += `
      ORDER BY 
        CASE 
          WHEN e.created_by IS NULL AND e.is_public = true THEN 1
          WHEN e.created_by = $1 THEN 2
          ELSE 3
        END,
        e.name ASC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching exercises for user:', error);
    throw new Error('Failed to fetch exercises');
  }
}

/**
 * Get a single exercise by ID
 */
export async function getExerciseById(id: string): Promise<Exercise | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM exercises WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching exercise:', error);
    throw new Error('Failed to fetch exercise');
  }
}

/**
 * 🎓 NEW: Get single exercise with permission check
 * Returns exercise only if user has permission to view it
 */
export async function getExerciseByIdForUser(
  id: string,
  userId: string
): Promise<Exercise | null> {
  try {
    const query = `
      SELECT 
        e.*,
        u.username as creator_name,
        CASE 
          WHEN e.created_by IS NULL AND e.is_public = true THEN 'admin'
          WHEN e.created_by = $2 THEN 'mine'
          WHEN e.is_shared = true THEN 'shared'
          ELSE 'admin'
        END as source
      FROM exercises e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 
        e.id = $1
        AND (
          e.is_public = true 
          OR e.created_by = $2
          -- OR e.is_shared = true
        )
      LIMIT 1
    `;
    
    const result = await pool.query(query, [id, userId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching exercise:', error);
    throw new Error('Failed to fetch exercise');
  }
}

/**
 * Get exercises by category
 */
export async function getExercisesByCategory(category: string): Promise<Exercise[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM exercises WHERE category = $1 ORDER BY name ASC',
      [category]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching exercises by category:', error);
    throw new Error('Failed to fetch exercises by category');
  }
}

/**
 * Search exercises by name
 */
export async function searchExercises(searchTerm: string): Promise<Exercise[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM exercises WHERE name ILIKE $1 ORDER BY name ASC',
      [`%${searchTerm}%`]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching exercises:', error);
    throw new Error('Failed to search exercises');
  }
}

/**
 * 🎓 UPDATED: Create a new exercise (USER-OWNED)
 * Creates private exercise owned by the user
 */
export async function createExercise(
  input: CreateExerciseInput,
  userId: string
): Promise<Exercise> {
  try {
    const result = await pool.query(
      `INSERT INTO exercises (
        created_by, is_public, is_shared,
        name, category, muscle_groups, equipment_needed, 
        instructions, demo_video_url, description
      )
      VALUES ($1, false, false, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        userId,                          // User owns this exercise
        input.name,
        input.category || null,
        input.muscle_groups || null,
        input.equipment_needed || null,
        input.instructions || null,
        input.demo_video_url || null,
        input.description || null
      ]
    );
    return result.rows[0];
  } catch (error: any) {
    console.error('Error creating exercise:', error);
    if (error.code === '23505') {
      throw new Error('An exercise with this name already exists');
    }
    throw new Error('Failed to create exercise');
  }
}

/**
 * 🎓 NEW: Create admin exercise (PUBLIC)
 * Only admins should call this - creates public exercise for everyone
 */
export async function createAdminExercise(
  input: CreateExerciseInput
): Promise<Exercise> {
  try {
    const result = await pool.query(
      `INSERT INTO exercises (
        created_by, is_public, is_shared,
        name, category, muscle_groups, equipment_needed, 
        instructions, demo_video_url, description
      )
      VALUES (NULL, true, false, $1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        input.name,
        input.category || null,
        input.muscle_groups || null,
        input.equipment_needed || null,
        input.instructions || null,
        input.demo_video_url || null,
        input.description || null
      ]
    );
    return result.rows[0];
  } catch (error: any) {
    console.error('Error creating admin exercise:', error);
    if (error.code === '23505') {
      throw new Error('An exercise with this name already exists');
    }
    throw new Error('Failed to create admin exercise');
  }
}

/**
 * 🎓 UPDATED: Update an existing exercise
 * Now includes ownership check - user can only update their own exercises
 */
export async function updateExercise(
  id: string,
  input: UpdateExerciseInput,
  userId: string
): Promise<Exercise | null> {
  try {
    // First check ownership
    const ownerCheck = await pool.query(
      'SELECT created_by FROM exercises WHERE id = $1',
      [id]
    );
    
    if (ownerCheck.rows.length === 0) {
      throw new Error('Exercise not found');
    }
    
    if (ownerCheck.rows[0].created_by !== userId) {
      throw new Error('Unauthorized: You can only edit your own exercises');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(input.name);
    }
    if (input.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(input.category);
    }
    if (input.muscle_groups !== undefined) {
      fields.push(`muscle_groups = $${paramCount++}`);
      values.push(input.muscle_groups);
    }
    if (input.equipment_needed !== undefined) {
      fields.push(`equipment_needed = $${paramCount++}`);
      values.push(input.equipment_needed);
    }
    if (input.instructions !== undefined) {
      fields.push(`instructions = $${paramCount++}`);
      values.push(input.instructions);
    }
    if (input.demo_video_url !== undefined) {
      fields.push(`demo_video_url = $${paramCount++}`);
      values.push(input.demo_video_url);
    }
    if (input.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(input.description);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE exercises 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error: any) {
    console.error('Error updating exercise:', error);
    if (error.code === '23505') {
      throw new Error('An exercise with this name already exists');
    }
    if (error.message.includes('Unauthorized')) {
      throw error;
    }
    throw new Error('Failed to update exercise');
  }
}

/**
 * 🎓 UPDATED: Delete an exercise
 * Now includes ownership check - user can only delete their own exercises
 */
export async function deleteExercise(id: string, userId: string): Promise<boolean> {
  try {
    // Delete with ownership check in one query
    const result = await pool.query(
      'DELETE FROM exercises WHERE id = $1 AND created_by = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      // Check if exercise exists but user doesn't own it
      const exists = await pool.query('SELECT id FROM exercises WHERE id = $1', [id]);
      if (exists.rows.length > 0) {
        throw new Error('Unauthorized: You can only delete your own exercises');
      }
      throw new Error('Exercise not found');
    }
    
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error: any) {
    console.error('Error deleting exercise:', error);
    if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
      throw error;
    }
    throw new Error('Failed to delete exercise');
  }
}

/**
 * Get total count of exercises (for pagination)
 */
export async function getExercisesCount(category?: string): Promise<number> {
  try {
    let query = 'SELECT COUNT(*) FROM exercises';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error counting exercises:', error);
    throw new Error('Failed to count exercises');
  }
}

/**
 * 🎓 NEW: Get count of exercises visible to user
 */
export async function getExercisesCountForUser(
  userId: string,
  category?: string
): Promise<number> {
  try {
    let query = `
      SELECT COUNT(*) 
      FROM exercises 
      WHERE 
        is_public = true 
        OR created_by = $1
    `;
    const params: any[] = [userId];

    if (category) {
      query += ' AND category = $2';
      params.push(category);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error counting exercises:', error);
    throw new Error('Failed to count exercises');
  }
}

/**
 * 🎓 NEW: Share exercise with community (Future Feature)
 */
export async function shareExercise(
  exerciseId: string,
  userId: string
): Promise<Exercise | null> {
  try {
    const result = await pool.query(
      `UPDATE exercises 
       SET is_shared = true
       WHERE id = $1 AND created_by = $2
       RETURNING *`,
      [exerciseId, userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Exercise not found or unauthorized');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error sharing exercise:', error);
    throw new Error('Failed to share exercise');
  }
}

/**
 * 🎓 NEW: Unshare exercise (Future Feature)
 */
export async function unshareExercise(
  exerciseId: string,
  userId: string
): Promise<Exercise | null> {
  try {
    const result = await pool.query(
      `UPDATE exercises 
       SET is_shared = false
       WHERE id = $1 AND created_by = $2
       RETURNING *`,
      [exerciseId, userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Exercise not found or unauthorized');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error unsharing exercise:', error);
    throw new Error('Failed to unshare exercise');
  }
}