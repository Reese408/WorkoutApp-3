'use client';

import { useState } from 'react';
import { Clock, Dumbbell, Edit, Trash2, Plus, Play } from 'lucide-react';
import Link from 'next/link';
import { useWorkoutRoutines, useDeleteWorkoutRoutine } from '@/lib/queries/useWorkoutRoutines';

interface WorkoutListProps {
  onDelete?: (id: string) => void;
}

export default function WorkoutList({ onDelete }: WorkoutListProps) {
  const { data: workouts, isLoading, error } = useWorkoutRoutines();
  const deleteRoutine = useDeleteWorkoutRoutine();
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
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
          {error instanceof Error ? error.message : 'Failed to load workouts'}
        </div>
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
        <p className="text-gray-600 mb-6">Create your first workout to get started!</p>
        <Link
          href="/routines/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Create Routine
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{workout.name}</h3>
                {workout.description && (
                  <p className="text-gray-600 text-sm">{workout.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/routines/${workout.id}/execute`}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Start workout"
                >
                  <Play size={18} />
                </Link>
                <Link
                  href={`/routines/edit/${workout.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit workout"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={() => setDeleteConfirm(workout.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete workout"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Dumbbell size={16} />
                {workout.totalExercises} {workout.totalExercises === 1 ? 'exercise' : 'exercises'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} />
                {workout.totalTime} minutes
              </span>
            </div>

            {/* Exercise Preview */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Exercises:</h4>
              <div className="space-y-2">
                {workout.exercises.slice(0, 3).map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded"
                  >
                    <span className="text-gray-900">{exercise.exerciseName}</span>
                    <span className="text-gray-600">
                      {exercise.sets} × {exercise.reps} reps · {exercise.timeMinutes} min
                    </span>
                  </div>
                ))}
                {workout.exercises.length > 3 && (
                  <p className="text-sm text-gray-500 text-center py-1">
                    + {workout.exercises.length - 3} more exercises
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delete Confirmation */}
          {deleteConfirm === workout.id && (
            <div className="border-t border-gray-200 bg-red-50 px-6 py-4">
              <p className="text-sm text-gray-900 mb-3">
                Are you sure you want to delete this workout? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
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