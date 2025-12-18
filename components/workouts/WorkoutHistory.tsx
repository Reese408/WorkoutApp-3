'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import type { WorkoutLogWithDetails } from '@/models/WorkoutLog';
import WorkoutHistoryCard from './WorkoutHistoryCard';
import { useWorkoutLogs } from '@/lib/queries/useWorkoutLogs';

interface WorkoutHistoryProps {
  initialLogs?: WorkoutLogWithDetails[];
  userIdentifier?: string;
}

export default function WorkoutHistory({ initialLogs = [], userIdentifier }: WorkoutHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');

  const { data, isLoading: loading } = useWorkoutLogs({
    status: filter === 'all' ? undefined : filter === 'completed' ? 'completed' : 'active',
  });

  const logs = (data?.logs as any) || initialLogs;

  const filteredLogs = logs.filter((log: WorkoutLogWithDetails) => {
    if (filter === 'completed') return log.completed_at !== null;
    if (filter === 'in-progress') return log.completed_at === null;
    return true;
  });

  const stats = {
    total: logs.length,
    completed: logs.filter((l: any) => l.completed_at).length,
    inProgress: logs.filter((l: any) => !l.completed_at).length,
    totalMinutes: logs.reduce((sum: number, l: any) => sum + (l.duration_minutes || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Workouts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Time</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalMinutes}m</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({stats.completed})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'in-progress'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            In Progress ({stats.inProgress})
          </button>
        </div>
      </div>

      {/* Workout Logs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading workout history...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No workout logs found</p>
          <p className="text-sm text-gray-500">Start a workout to see it here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log: any) => (
            <WorkoutHistoryCard
              key={log.id}
              log={log}
              onRefresh={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
