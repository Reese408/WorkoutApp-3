import { Suspense } from 'react';
import { getWorkoutLogs } from '@/lib/workout-logs';
import WorkoutHistory from '@/components/workouts/WorkoutHistory';

export const metadata = {
  title: 'Workout History | Workout App',
  description: 'View your workout history and progress',
};

export default async function WorkoutHistoryPage() {
  // In a real app, you'd get the user identifier from auth
  const userIdentifier = 'demo-user@example.com';
  const logs = await getWorkoutLogs(userIdentifier);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout History</h1>
          <p className="text-gray-600">
            Track your progress and view past workout sessions
          </p>
        </div>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <WorkoutHistory initialLogs={logs} userIdentifier={userIdentifier} />
        </Suspense>
      </div>
    </div>
  );
}
