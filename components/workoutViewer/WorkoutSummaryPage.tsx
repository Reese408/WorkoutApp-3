'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, TrendingUp, Dumbbell, Clock, ChevronRight } from 'lucide-react';
import { getWorkoutSessionSummary } from '@/app/actions/workouts';
import type { WorkoutSessionSummary } from '@/lib/types';
import { Button } from '../ui/button';

export default function WorkoutSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [summary, setSummary] = useState<WorkoutSessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      if (!sessionId) {
        router.push('/workouts');
        return;
      }

      try {
        const response = await getWorkoutSessionSummary(sessionId);

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load summary');
        }

        setSummary(response.data);
      } catch (err: any) {
        console.error('Error loading summary:', err);
        setError(err.message || 'Failed to load workout summary');
      } finally {
        setIsLoading(false);
      }
    }

    loadSummary();
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Workout summary not found'}
          </p>
          <Button onClick={() => router.push('/workouts')}>
            Back to Workouts
          </Button>
        </div>
      </div>
    );
  }

  const workoutName = summary.workoutLog.routine?.name || 'Quick Workout';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-gray-900">
      {/* Celebration Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Trophy className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Workout Complete! 🎉</h1>
          <p className="text-green-100 dark:text-green-200 text-lg">{workoutName}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700">
            <Dumbbell className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Volume</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {summary.totalWeight.toLocaleString()}
              <span className="text-lg text-gray-500 dark:text-gray-400"> lbs</span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700">
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sets Completed</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {summary.totalSets}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700">
            <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {summary.duration}
              <span className="text-lg text-gray-500 dark:text-gray-400"> min</span>
            </p>
          </div>
        </div>

        {/* Exercise Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Exercise Breakdown</h2>
          <div className="space-y-6">
            {summary.exerciseSummaries.map((exerciseSummary) => (
              <div key={exerciseSummary.exerciseId} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{exerciseSummary.exerciseName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Sets</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {exerciseSummary.sets}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Reps</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {exerciseSummary.totalReps}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max Weight</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {exerciseSummary.maxWeight} lbs
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/workouts')}
            className="h-14"
          >
            View All Workouts
          </Button>

          <Button
            size="lg"
            onClick={() => router.push('/dashboard')}
            className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <span>Back to Dashboard</span>
            <ChevronRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
