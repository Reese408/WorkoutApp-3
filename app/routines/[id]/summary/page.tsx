'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, TrendingUp, Dumbbell, Clock, ChevronRight } from 'lucide-react';
import { useWorkout } from '@/hooks/use-workouts';

export default function WorkoutSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const { data, isLoading } = useWorkout(sessionId || '');

  const summary = data?.data as any;

  if (!sessionId) {
    router.push('/workouts');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Workout summary not found</p>
          <button
            onClick={() => router.push('/workouts')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  const { session, sets, workout_name, duration_minutes } = summary;

  // Group sets by exercise
  const exerciseGroups = sets.reduce((acc: any, set: any) => {
    if (!acc[set.exercise_name]) {
      acc[set.exercise_name] = [];
    }
    acc[set.exercise_name].push(set);
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Celebration Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Trophy className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Workout Complete! 🎉</h1>
          <p className="text-green-100 dark:text-green-200 text-lg">{workout_name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <Dumbbell className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Volume</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {session.total_volume.toLocaleString()}
              <span className="text-lg text-gray-500 dark:text-gray-400"> lbs</span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sets Completed</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {session.total_sets_completed}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {duration_minutes}
              <span className="text-lg text-gray-500 dark:text-gray-400"> min</span>
            </p>
          </div>
        </div>

        {/* Exercise Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Exercise Breakdown</h2>
          <div className="space-y-6">
            {Object.entries(exerciseGroups).map(([exerciseName, exerciseSets]) => (
              <div key={exerciseName} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{exerciseName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(exerciseSets as any[]).map((set: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Set {set.set_number}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {set.reps_completed} reps
                        {set.weight_used && (
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                            @ {set.weight_used} lbs
                          </span>
                        )}
                      </p>
                      {set.rpe && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">RPE: {set.rpe}/10</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
          <button
            onClick={() => router.push('/workouts')}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 py-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span>View All Workouts</span>
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all shadow-md"
          >
            <span>Back to Dashboard</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}