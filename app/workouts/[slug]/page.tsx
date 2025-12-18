import { getWorkoutBySlug } from '../../../../lib/workouts';
import S3Image from '../../../../components/images/S3Image';
import { notFound } from 'next/navigation';

interface WorkoutDetailsProps {
  params: { slug: string };
}

export default async function WorkoutDetails({ params }: WorkoutDetailsProps) {
  const { slug } = await params;
  const workout = await getWorkoutBySlug(slug);

  if (!workout) {
    notFound();
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">{workout.title}</h1>
      <p className="text-gray-500 mb-6">By {workout.creator}</p>
      <div className="relative w-full aspect-video mb-6 rounded-lg overflow-hidden">
      <S3Image
        s3Key={workout.image || workout.image_key}
        alt={workout.title}
        className="object-cover"
      />
      </div>
      <p className="text-lg mb-4">{workout.summary}</p>
      <p className="text-sm text-gray-500">Duration: {workout.duration} minutes</p>
      <p className="text-sm text-gray-500">
        Posted: {new Date(workout.date).toLocaleDateString()}
      </p>
    </main>
  );
}
