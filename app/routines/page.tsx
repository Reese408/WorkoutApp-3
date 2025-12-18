import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import WorkoutList from '@/components/workouts/WorkoutList';

export default function RoutinesPage() {
  return (
    <div className="space-y-6 p-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Workout Routines</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage your custom workout plans</p>
        </div>
        <Link
          href="/routines/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Create Routine
        </Link>
      </div>

      <Suspense fallback={<div className="text-gray-600 dark:text-gray-400">Loading routines...</div>}>
        <WorkoutList />
      </Suspense>
    </div>
  );
}