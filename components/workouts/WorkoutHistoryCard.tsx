'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle, Play, Trash2, Dumbbell } from 'lucide-react';
import type { WorkoutHistoryItem } from '@/lib/types';
import { deleteWorkout } from '@/app/actions/workouts';
import { Button } from '@/components/ui/button';

interface WorkoutHistoryCardProps {
  log: WorkoutHistoryItem;
  onRefresh: () => void;
}

export default function WorkoutHistoryCard({ log, onRefresh }: WorkoutHistoryCardProps) {
  const [deleting, setDeleting] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workout log?')) return;

    setDeleting(true);
    try {
      const result = await deleteWorkout(log.id);
      if (result.success) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting workout log:', error);
    } finally {
      setDeleting(false);
    }
  };

  const isCompleted = !!log.endTime;
  const routineName = log.routine?.name || 'Quick Workout';
  const routineDeleted = log.routineId && !log.routine;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {routineName}
              {routineDeleted && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">(Deleted)</span>
              )}
            </h3>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 rounded">
                <Play className="w-3 h-3" />
                In Progress
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Started: {formatDate(log.startTime)}</span>
            </div>
            {isCompleted && log.totalDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{log.totalDuration} minutes</span>
              </div>
            )}
            {log._count?.setLogs !== undefined && (
              <div className="flex items-center gap-1">
                <Dumbbell className="w-4 h-4" />
                <span>{log._count.setLogs} sets completed</span>
              </div>
            )}
          </div>

          {log.notes && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 italic">{log.notes}</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Delete workout log"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex gap-2">
        {!isCompleted && log.routineId && !routineDeleted && (
          <Link
            href={`/routines/${log.routineId}/execute`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            Continue Workout
          </Link>
        )}
        {!isCompleted && routineDeleted && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg text-sm cursor-not-allowed">
            <Play className="w-4 h-4" />
            Routine Deleted
          </div>
        )}
        {log.routineId ? (
          <Link
            href={`/routines/${log.routineId}/summary?log=${log.id}`}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            View Details
          </Link>
        ) : (
          <div className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg text-sm cursor-not-allowed">
            No Details Available
          </div>
        )}
      </div>
    </div>
  );
}
