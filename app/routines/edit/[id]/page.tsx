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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Edit Workout Routine</h1>
      <WorkoutEditClient routineId={id} initialData={routine} />
    </div>
  );
}