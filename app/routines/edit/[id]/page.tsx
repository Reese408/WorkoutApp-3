// src/app/routines/edit/[id]/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import WorkoutEditClient from '@/components/workouts/WorkoutEditClient';

async function getRoutine(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) redirect('/login');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/workout-routines/${id}`,
    {
      headers: { Cookie: `auth_token=${token}` },
      cache: 'no-store',
    }
  );

  if (!response.ok) throw new Error('Failed to fetch routine');
  const data = await response.json();
  
  // ✨ TRANSFORM DATA HERE for the form
  const routine = data.routine;
  return {
    name: routine.name,
    description: routine.description || '',
    exercises: (routine.exercises || []).map((ex: any) => ({
      exerciseId: ex.exercise_id,        // ← Transform to camelCase
      exerciseName: ex.exercise_name,    // ← Transform to camelCase
      sets: ex.sets || 3,
      reps: ex.reps || 10,
      timeMinutes: Math.round(ex.time_minutes) || 5,  // ← Transform to camelCase
      order: ex.order || 0
    }))
  };
}

export default async function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const routine = await getRoutine(id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Workout Routine</h1>
      <WorkoutEditClient routineId={id} initialData={routine} />
    </div>
  );
}