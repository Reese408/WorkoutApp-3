import { getWorkout } from '@/app/actions/workouts';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface WorkoutDetailsProps {
  params: Promise<{ slug: string }>;
}

export default async function WorkoutDetails({ params }: WorkoutDetailsProps) {
  const { slug } = await params;
  const result = await getWorkout(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const workout = result.data;

  return (
    <main className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/workouts/history"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 inline-block transition-colors"
        >
          ← Back to History
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{workout.routine?.name || 'Workout'}</h1>

          {workout.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Notes</h3>
              <p className="text-gray-900 dark:text-gray-100">{workout.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Time</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(workout.startTime).toLocaleTimeString()}
              </p>
            </div>

            {workout.endTime && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Time</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(workout.endTime).toLocaleTimeString()}
                </p>
              </div>
            )}

            {workout.totalDuration && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {workout.totalDuration} min
                </p>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sets</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {workout.setLogs?.length || 0}
              </p>
            </div>
          </div>

          {workout.setLogs && workout.setLogs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Exercise Log</h2>
              <div className="space-y-4">
                {workout.setLogs.map((set: any, index: number) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{set.exercise.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Set:</span>
                        <span className="ml-2 text-gray-900 dark:text-white font-medium">{set.setNumber}</span>
                      </div>
                      {set.reps && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Reps:</span>
                          <span className="ml-2 text-gray-900 dark:text-white font-medium">{set.reps}</span>
                        </div>
                      )}
                      {set.weight && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                          <span className="ml-2 text-gray-900 dark:text-white font-medium">{set.weight} lbs</span>
                        </div>
                      )}
                      {set.duration && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                          <span className="ml-2 text-gray-900 dark:text-white font-medium">{set.duration}s</span>
                        </div>
                      )}
                    </div>
                    {set.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{set.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
