import { getExercises } from "@/app/actions/exercises";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ExerciseCardLink from "@/components/exercises/ExerciseCardLink";

export default async function ExercisesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/signin');
  }

  const result = await getExercises();
  const exercises = result.success ? result.data : [];

  return (
    <main className="p-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exercise Library</h1>
        <Link
          href="/exercises/create"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Create New Exercise
        </Link>
      </div>

      {exercises.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No exercises yet. Create your first one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise: any) => (
            <ExerciseCardLink
              key={exercise.id}
              exercise={exercise}
              href={`/exercises/${exercise.id}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}