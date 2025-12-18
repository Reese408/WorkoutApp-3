'use client';

import { useRouter } from 'next/navigation';
import WorkoutForm from '@/components/workouts/WorkoutForm';

export default function CreateRoutinePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const response = await fetch('/api/workout-routines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create routine');
    }

    router.push('/routines');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Workout Routine</h1>
      <WorkoutForm 
        mode="create" 
        onSubmit={handleSubmit} 
        onCancel={() => router.push('/routines')} 
      />
    </div>
  );
}