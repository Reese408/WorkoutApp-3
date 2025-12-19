'use client';

import { useRouter } from 'next/navigation';
import WorkoutForm from '@/components/workouts/WorkoutForm';
import { updateRoutine } from '@/app/actions/routines';
import type { CreateRoutineFormData, RoutineWithDetails } from '@/lib/types';

interface WorkoutEditClientProps {
  routineId: string;
  initialData: RoutineWithDetails;
}

export default function WorkoutEditClient({ routineId, initialData }: WorkoutEditClientProps) {
  const router = useRouter();

  const handleSubmit = async (data: CreateRoutineFormData) => {
    try {
      const response = await updateRoutine(routineId, data);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update routine');
      }

      router.push('/routines');
    } catch (error) {
      console.error('Error updating routine:', error);
      throw error;
    }
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