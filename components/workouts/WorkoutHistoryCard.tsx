'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle, Play, Trash2 } from 'lucide-react';
import type { WorkoutLogWithDetails } from '@/models/WorkoutLog';
import { deleteWorkoutLogAction } from '@/lib/actions';

interface WorkoutHistoryCardProps {
  log: WorkoutLogWithDetails;
  onRefresh: () => void;
}

export default function WorkoutHistoryCard({ log, onRefresh }: WorkoutHistoryCardProps) {
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
      const result = await deleteWorkoutLogAction(log.id);
      if (result.success) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting workout log:', error);
    } finally {
      setDeleting(false);
    }
  };

  const isCompleted = !!log.completed_at;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{log.workout_title}</h3>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                <Play className="w-3 h-3" />
                In Progress
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Started: {formatDate(log.started_at.toString())}</span>
            </div>
            {isCompleted && log.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{log.duration_minutes} minutes</span>
              </div>
            )}
          </div>

          {log.notes && (
            <p className="mt-2 text-sm text-gray-700 italic">{log.notes}</p>
          )}
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors disabled:opacity-50"
          title="Delete workout log"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2">
        {!isCompleted && (
          <Link
            href={`/workouts/${log.workout_slug}/play/${log.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Continue Workout
          </Link>
        )}
        <Link
          href={`/workouts/history/${log.id}`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
