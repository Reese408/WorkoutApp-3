'use client';

import { useRouter } from 'next/navigation';
import WorkoutForm from '@/components/workouts/WorkoutForm';
import { useCreateRoutine } from '@/hooks/use-routines';

export default function CreateRoutinePage() {
  const router = useRouter();
  const createRoutine = useCreateRoutine();

  const handleSubmit = async (data: any) => {
    const result = await createRoutine.mutateAsync(data);

    if (!result.success) {
      throw new Error(result.error || 'Failed to create routine');
    }

    router.push('/routines');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Workout Routine</h1>
      <WorkoutForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push('/routines')}
      />
    </div>
  );
}