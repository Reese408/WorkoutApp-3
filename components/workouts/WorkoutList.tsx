'use client';

import { useState } from 'react';
import { Clock, Dumbbell, Edit, Trash2, Plus, Play } from 'lucide-react';
import Link from 'next/link';
import { useRoutines, useDeleteRoutine } from '@/hooks/use-routines';

interface WorkoutListProps {
  onDelete?: (id: string) => void;
}

export default function WorkoutList({ onDelete }: WorkoutListProps) {
  const { data: result, isLoading, error } = useRoutines();
  const workouts = result?.success ? result.data : [];
  const deleteRoutine = useDeleteRoutine();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteRoutine.mutateAsync(id);
      setDeleteConfirm(null);

      // Call parent callback if provided
      if (onDelete) onDelete(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete workout');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 dark:border-blue-400 border-r-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg inline-block">
          {error instanceof Error ? error.message : 'Failed to load workouts'}
        </div>
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No workouts yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first workout to get started!</p>
        <Link
          href="/routines/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Create Routine
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout: any) => (
        <div
          key={workout.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{workout.name}</h3>
                {workout.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{workout.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/routines/${workout.id}/execute`}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Start workout"
                >
                  <Play size={18} />
                </Link>
                <Link
                  href={`/routines/edit/${workout.id}`}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit workout"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={() => setDeleteConfirm(workout.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete workout"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Dumbbell size={16} />
                {workout.exercises?.length || 0} exercises
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} />
                {workout._count?.workoutLogs || 0} times completed
              </span>
            </div>

            {/* Exercise Preview */}
            {workout.exercises && workout.exercises.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exercises:</h4>
                <div className="space-y-2">
                  {workout.exercises.slice(0, 3).map((ex: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-gray-900 dark:text-gray-100">{ex.exercise.name}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {ex.targetSets} sets × {ex.targetReps || 0} reps
                      </span>
                    </div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-1">
                      + {workout.exercises.length - 3} more exercises
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation */}
          {deleteConfirm === workout.id && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 px-6 py-4">
              <p className="text-sm text-gray-900 dark:text-gray-100 mb-3">
                Are you sure you want to delete this workout? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white text-sm rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}