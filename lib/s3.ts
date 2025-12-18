import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Get signed URL for viewing an S3 object
 */
export async function getSignedImageUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get signed URL for uploading to S3
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300 // 5 minutes for uploads
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get all public workouts with signed image URLs
 */
export async function getSignedWorkoutImages() {
  try {
    const workouts = await prisma.publicWorkout.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map and sign URLs in parallel
    const signedWorkouts = await Promise.all(
      workouts.map(async (workout: any) => {
        const signedUrl = await getSignedImageUrl(workout.imageKey);

        return {
          id: workout.id,
          title: workout.title,
          slug: workout.slug,
          summary: workout.summary,
          duration: workout.duration,
          creator: workout.creator,
          createdAt: workout.createdAt,
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

/**
 * Generate a unique S3 key for an image upload
 */
export function generateS3Key(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `uploads/${userId}/${timestamp}-${sanitized}`;
}
