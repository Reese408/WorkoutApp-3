import { getExerciseById } from "@/lib/exercises";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ExerciseDetailsPageProps {
    params: {
        id: string;
    };
}

export default async function ExerciseIdPage({params}: ExerciseDetailsPageProps) {
    const exercise = await getExerciseById(params.id);

    if(!exercise){
        notFound();
    }

    return(
      <main className="p-8 max-w-4xl mx-auto">
         <div className="mb-6">
        <Link 
          href="/exercises"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Exercises
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{exercise.name}</h1>
            <Link
            href={`/exercises/edit/${exercise.id}`}  // ⭐ Add curly braces
            className="text-blue-600 hover:text-blue-800 font-medium"
            >
            Edit
            </Link>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Category</h3>
            <p className="text-lg">{exercise.category}</p>
          </div>

          {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Muscle Groups</h3>
              <p className="text-lg">{exercise.muscle_groups.join(', ')}</p>
            </div>
          )}

          {exercise.equipment_needed && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Equipment Needed</h3>
              <p className="text-lg">{exercise.equipment_needed}</p>
            </div>
          )}

          {exercise.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Description</h3>
              <p className="text-lg">{exercise.description}</p>
            </div>
          )}

          {exercise.instructions && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Instructions</h3>
              <p className="text-lg whitespace-pre-wrap">{exercise.instructions}</p>
            </div>
          )}

          {exercise.demo_video_url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Demo Video</h3>
              <a 
                href={exercise.demo_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Watch Video →
              </a>
            </div>
          )}
        </div>
      </div>
      </main>
    );
}