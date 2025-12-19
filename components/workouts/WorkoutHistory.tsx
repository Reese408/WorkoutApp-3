'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import WorkoutHistoryCard from './WorkoutHistoryCard';
import { useWorkoutHistory } from '@/hooks/use-workouts';

interface WorkoutHistoryProps {
  initialLogs?: any[];
}

export default function WorkoutHistory({ initialLogs = [] }: WorkoutHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');

  const { data: result, isLoading: loading } = useWorkoutHistory(50, 0);
  const logs = result?.success ? result.data : initialLogs;
  const safetyLogs = logs || [];

  const filteredLogs = safetyLogs.filter((log: any) => {
    if (filter === 'completed') return log.endTime !== null;
    if (filter === 'in-progress') return log.endTime === null;
    return true;
  });

  const stats = {
    total: safetyLogs.length,
    completed: safetyLogs.filter((l: any) => l.endTime).length,
    inProgress: safetyLogs.filter((l: any) => !l.endTime).length,
    totalMinutes: safetyLogs.reduce((sum: number, l: any) => sum + (l.totalDuration || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Workouts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.inProgress}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500 dark:text-orange-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalMinutes}m</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-green-600 dark:bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Completed ({stats.completed})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'in-progress'
                ? 'bg-orange-600 dark:bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            In Progress ({stats.inProgress})
          </button>
        </div>
      </div>

      {/* Workout Logs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workout history...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">No workout logs found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Start a workout to see it here!</p>
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
