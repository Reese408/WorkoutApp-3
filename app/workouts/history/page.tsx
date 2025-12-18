import { Suspense } from 'react';
import { getWorkoutHistory } from '@/app/actions/workouts';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import WorkoutHistory from '@/components/workouts/WorkoutHistory';

export const metadata = {
  title: 'Workout History | Workout App',
  description: 'View your workout history and progress',
};

export default async function WorkoutHistoryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/signin');
  }

  const result = await getWorkoutHistory(20, 0);
  const logs = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Workout History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and view past workout sessions
          </p>
        </div>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        }>
          <WorkoutHistory initialLogs={logs} />
        </Suspense>
      </div>
    </div>
  );
}
