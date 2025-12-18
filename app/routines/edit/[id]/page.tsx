import { getRoutine } from "@/app/actions/routines";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import WorkoutEditClient from '@/components/workouts/WorkoutEditClient';

export default async function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/signin');
  }

  const { id } = await params;
  const result = await getRoutine(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const routine = result.data;

  // Transform data for the form
  const formData = {
    name: routine.name,
    description: routine.description || '',
    exercises: (routine.exercises || []).map((ex: any) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exercise.name,
      sets: ex.targetSets || 3,
      reps: ex.targetReps || 10,
      timeMinutes: ex.targetDuration || 5,
      order: ex.orderIndex || 0
    }))
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Edit Workout Routine</h1>
      <WorkoutEditClient routineId={id} initialData={formData} />
    </div>
  );
}