// src/components/workouts/WorkoutEditClient.tsx
'use client';

import { useRouter } from 'next/navigation';
import WorkoutForm from '@/components/workouts/WorkoutForm';

export default function WorkoutEditClient({ routineId, initialData }: any) {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    // Transform back to snake_case for API
    const apiData = {
      name: data.name,
      description: data.description,
      exercises: data.exercises.map((ex: any) => ({
        exercise_id: ex.exerciseId,     // ← camelCase to snake_case
        sets: ex.sets,
        reps: ex.reps,
        time_minutes: ex.timeMinutes,   // ← camelCase to snake_case
        order: ex.order
      }))
    };

    const response = await fetch(`/api/workout-routines/${routineId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update routine');
    }

    router.push('/routines');
  };

  return (
    <WorkoutForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/routines')}
    />
  );
}