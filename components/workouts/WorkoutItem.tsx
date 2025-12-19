'use client';

import Link from "next/link";
import { Calendar, Dumbbell, TrendingUp } from 'lucide-react';
import type { RoutineWithDetails } from "@/lib/types";

interface WorkoutItemProps {
  routine: RoutineWithDetails;
}

export default function WorkoutItem({ routine }: WorkoutItemProps) {
  const exerciseCount = routine.exercises.length;
  const totalSets = routine.exercises.reduce((sum, ex) => sum + ex.targetSets, 0);
  const creatorName = routine.creator?.name || routine.creator?.email || 'Anonymous';

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow">
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <header>
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{routine.name}</h2>
            {routine.isPublic && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded">
                Public
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            By {creatorName}
          </p>
        </header>

        {routine.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {routine.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4" />
            <span>{exerciseCount} exercises</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{totalSets} total sets</span>
          </div>
          {routine._count?.workoutLogs !== undefined && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{routine._count.workoutLogs} completions</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/routines/${routine.id}`}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            View Routine
          </Link>
          <Link
            href={`/routines/${routine.id}/execute`}
            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            Start Workout
          </Link>
        </div>
      </div>
    </article>
  );
}
