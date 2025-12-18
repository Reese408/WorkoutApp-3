import pool from './db';

export async function getWorkouts() {
  const result = await pool.query('SELECT * FROM workouts ORDER BY date DESC');
  return result.rows;
}

export async function getWorkoutBySlug(slug: string) {
  const result = await pool.query('SELECT * FROM workouts WHERE slug = $1', [slug]);
  return result.rows[0];
}

export async function saveWorkout(workout: any) {
  const { title, duration, image_key, video_key, creator, summary, date } = workout;
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  
  const query = `
    INSERT INTO workouts (title, slug, duration, image_key, video_key, creator, summary, date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    title, 
    slug, 
    duration, 
    image_key,    // S3 key like 'workouts/images/chest-day.jpg'
    video_key,    // S3 key like 'workouts/videos/chest-day.mp4'
    creator, 
    summary, 
    date
  ]);
  
  return result.rows[0];
}