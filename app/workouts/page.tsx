import Link from 'next/link';
import { Dumbbell, History, List, Plus } from 'lucide-react';

export default async function WorkoutPage() {
  return (
    <main className="p-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Workouts</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Track your progress and build your fitness journey</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href='/routines/create'
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Plus className="w-12 h-12 mb-3" />
            <h2 className="text-lg font-semibold">Create Workout</h2>
          </Link>

          <Link
            href='/workouts/history'
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <History className="w-12 h-12 mb-3" />
            <h2 className="text-lg font-semibold">Workout History</h2>
          </Link>

          <Link
            href='/routines'
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <List className="w-12 h-12 mb-3" />
            <h2 className="text-lg font-semibold">My Routines</h2>
          </Link>

          <Link
            href='/exercises'
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Dumbbell className="w-12 h-12 mb-3" />
            <h2 className="text-lg font-semibold">Browse Exercises</h2>
          </Link>
        </div>
      </div>
    </main>
  );
}