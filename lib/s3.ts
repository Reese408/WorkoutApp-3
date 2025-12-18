import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import pool from "./db";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedWorkoutImages() {
  try {
    // Fetch workouts that actually have an image_key column
    const result = await pool.query(`
      SELECT id, title, image_key, summary, date
      FROM workouts
      WHERE image_key IS NOT NULL
      ORDER BY date DESC
    `);

    const workouts = result.rows as {
      id: number;
      title: string;
      image_key: string;
      summary: string;
      date: string;
    }[];

    // Map and sign URLs in parallel
    const signedWorkouts = await Promise.all(
      workouts.map(async (workout) => {
        const signedUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: workout.image_key, // gets S3 key directly from your table
          }),
          { expiresIn: 3600 } // 1 hour expiration
        );

        return {
          id: workout.id,
          title: workout.title,
          summary: workout.summary,
          date: workout.date,
          imageUrl: signedUrl,
        };
      })
    );

    return signedWorkouts;
  } catch (error) {
    console.error("Error generating signed URLs for workouts:", error);
    throw new Error("Failed to retrieve workout images.");
  }
}
