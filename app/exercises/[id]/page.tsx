import { getExercise } from "@/app/actions/exercises";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ExerciseDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExerciseIdPage({ params }: ExerciseDetailsPageProps) {
  const { id } = await params;
  const result = await getExercise(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const exercise = result.data;

  return (
    <main className="p-8 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <Link
          href="/exercises"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block transition-colors"
        >
          ← Back to Exercises
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{exercise.name}</h1>
          <Link
            href={`/exercises/edit/${exercise.id}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Edit
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Category</h3>
            <p className="text-lg text-gray-900 dark:text-gray-100">{exercise.category}</p>
          </div>

          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Muscle Groups</h3>
              <p className="text-lg text-gray-900 dark:text-gray-100">{exercise.muscleGroups.join(', ')}</p>
            </div>
          )}

          {exercise.equipmentNeeded && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Equipment Needed</h3>
              <p className="text-lg text-gray-900 dark:text-gray-100">{exercise.equipmentNeeded}</p>
            </div>
          )}

          {exercise.instructions && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Instructions</h3>
              <p className="text-lg text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{exercise.instructions}</p>
            </div>
          )}

          {exercise.videoUrl && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Demo Video</h3>
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Watch Video →
              </a>
            </div>
          )}

          {exercise.demoGifUrl && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Demo GIF</h3>
              <img
                src={exercise.demoGifUrl}
                alt={`${exercise.name} demonstration`}
                className="rounded-lg max-w-md"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}