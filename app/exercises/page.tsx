// src/app/exercises/page.tsx
import { getExercisesForUser } from "@/lib/exercises";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";  // ⭐ Import redirect
import Link from "next/link";
import ExerciseCardLink from "@/components/exercises/ExerciseCardLink";

export default async function ExercisesPage() {
  // ⭐ Get the current user's session
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // ⭐ Use userId (lowercase 'i')
  const exercises = await getExercisesForUser(session.userId);

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exercise Library</h1>
        <Link 
          href="/exercises/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Exercise
        </Link>
      </div>

      {exercises.length === 0 ? (
        <p className="text-gray-600">No exercises yet. Create your first one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
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