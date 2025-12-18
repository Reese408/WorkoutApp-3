'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, TrendingUp, Dumbbell, Clock, ChevronRight } from 'lucide-react';

interface SessionSummary {
  session: {
    id: number;
    started_at: string;
    completed_at: string;
    total_volume: number;
    total_sets_completed: number;
    notes: string | null;
  };
  sets: Array<{
    exercise_name: string;
    set_number: number;
    reps_completed: number;
    weight_used: number | null;
    rpe: number | null;
  }>;
  workout_name: string;
  duration_minutes: number;
}

export default function WorkoutSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      if (!sessionId) {
        router.push('/workouts');
        return;
      }

      try {
        const response = await fetch(`/api/workout-sessions/${sessionId}/summary`);
        if (!response.ok) throw new Error('Failed to load summary');
        
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Error loading summary:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSummary();
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Workout summary not found</p>
          <button
            onClick={() => router.push('/workouts')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  const { session, sets, workout_name, duration_minutes } = summary;

  // Group sets by exercise
  const exerciseGroups = sets.reduce((acc, set) => {
    if (!acc[set.exercise_name]) {
      acc[set.exercise_name] = [];
    }
    acc[set.exercise_name].push(set);
    return acc;
  }, {} as Record<string, typeof sets>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Celebration Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Trophy className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Workout Complete! 🎉</h1>
          <p className="text-green-100 text-lg">{workout_name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Dumbbell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Volume</p>
            <p className="text-3xl font-bold text-gray-900">
              {session.total_volume.toLocaleString()}
              <span className="text-lg text-gray-500"> lbs</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Sets Completed</p>
            <p className="text-3xl font-bold text-gray-900">
              {session.total_sets_completed}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Duration</p>
            <p className="text-3xl font-bold text-gray-900">
              {duration_minutes}
              <span className="text-lg text-gray-500"> min</span>
            </p>
          </div>
        </div>

        {/* Exercise Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Exercise Breakdown</h2>
          <div className="space-y-6">
            {Object.entries(exerciseGroups).map(([exerciseName, exerciseSets]) => (
              <div key={exerciseName} className="border-b border-gray-200 pb-4 last:border-0">
                <h3 className="font-semibold text-gray-900 mb-3">{exerciseName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {exerciseSets.map((set, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <p className="text-xs text-gray-500 mb-1">Set {set.set_number}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {set.reps_completed} reps
                        {set.weight_used && (
                          <span className="text-sm text-gray-600 ml-1">
                            @ {set.weight_used} lbs
                          </span>
                        )}
                      </p>
                      {set.rpe && (
                        <p className="text-xs text-gray-500 mt-1">RPE: {set.rpe}/10</p>
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
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-300 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <span>View All Workouts</span>
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
          >
            <span>Back to Dashboard</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
