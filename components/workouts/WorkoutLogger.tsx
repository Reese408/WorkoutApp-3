'use client';

import { useState, useEffect } from 'react';
import { Play, Check, X, Clock, Dumbbell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRoutine } from '@/app/actions/routines';
import { startWorkout, logSet, completeWorkout } from '@/app/actions/workouts';
import type { RoutineWithDetails, WorkoutExerciseWithExercise } from '@/lib/types';

interface SetLogState {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export default function WorkoutLogger({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [routine, setRoutine] = useState<RoutineWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [setLogs, setSetLogs] = useState<SetLogState[]>([]);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch routine data
  useEffect(() => {
    fetchRoutine();
  }, [workoutId]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  const fetchRoutine = async () => {
    try {
      const response = await getRoutine(workoutId);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch routine');
      }

      setRoutine(response.data);

      // Initialize set logs from routine exercises
      const logs: SetLogState[] = [];
      response.data.exercises.forEach((workoutExercise) => {
        for (let i = 1; i <= workoutExercise.targetSets; i++) {
          logs.push({
            exerciseId: workoutExercise.exerciseId,
            setNumber: i,
            reps: workoutExercise.targetReps || 0,
            weight: 0,
            completed: false,
          });
        }
      });
      setSetLogs(logs);
    } catch (error) {
      console.error('Error fetching routine:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    try {
      const response = await startWorkout({
        routineId: workoutId,
        notes,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to start workout');
      }

      setWorkoutLogId(response.data.id);
      setIsWorkoutActive(true);
      setTimer(0);
    } catch (error) {
      console.error('Error starting workout:', error);
      alert('Failed to start workout. Please try again.');
    }
  };

  const completeSet = (exerciseId: string, setNumber: number, reps: number, weight: number) => {
    setSetLogs((prev) =>
      prev.map((log) =>
        log.exerciseId === exerciseId && log.setNumber === setNumber
          ? { ...log, reps, weight, completed: true }
          : log
      )
    );
  };

  const uncompleteSet = (exerciseId: string, setNumber: number) => {
    setSetLogs((prev) =>
      prev.map((log) =>
        log.exerciseId === exerciseId && log.setNumber === setNumber
          ? { ...log, completed: false }
          : log
      )
    );
  };

  const handleLogSet = async (exerciseId: string, setNumber: number, reps: number, weight: number) => {
    if (!workoutLogId) return;

    try {
      const response = await logSet(workoutLogId, {
        exerciseId,
        setNumber,
        reps,
        weight,
        completed: true,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to log set');
      }

      completeSet(exerciseId, setNumber, reps, weight);
    } catch (error) {
      console.error('Error logging set:', error);
      alert('Failed to log set. Please try again.');
    }
  };

  const finishWorkout = async () => {
    if (!workoutLogId) return;

    setSaving(true);
    try {
      const response = await completeWorkout({
        workoutId: workoutLogId,
        notes,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to complete workout');
      }

      // Redirect to workout summary
      router.push(`/workouts/summary?session=${workoutLogId}`);
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancelWorkout = () => {
    if (confirm('Are you sure you want to cancel this workout? Progress will not be saved.')) {
      router.push('/routines');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSetsForExercise = (exerciseId: string) => {
    return setLogs.filter((log) => log.exerciseId === exerciseId);
  };

  const getCompletedSetsCount = (exerciseId: string) => {
    return setLogs.filter((log) => log.exerciseId === exerciseId && log.completed).length;
  };

  const getTotalCompletedSets = () => {
    return setLogs.filter((log) => log.completed).length;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading routine...</p>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Routine not found</p>
      </div>
    );
  }

  const currentExercise = routine.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === routine.exercises.length - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Workout Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{routine.name}</h1>
            {routine.description && (
              <p className="text-gray-600 mt-1">{routine.description}</p>
            )}
          </div>
          {isWorkoutActive && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <Clock size={20} className="text-blue-600" />
              <span className="text-xl font-mono font-semibold text-blue-900">
                {formatTime(timer)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Dumbbell size={16} />
            {routine.exercises.length} exercises
          </span>
          <span>
            {getTotalCompletedSets()} / {setLogs.length} sets completed
          </span>
        </div>

        {!isWorkoutActive && (
          <button
            onClick={handleStartWorkout}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Play size={20} />
            Start Workout
          </button>
        )}
      </div>

      {/* Exercise List - Before starting */}
      {!isWorkoutActive && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Exercises</h2>
          <div className="space-y-3">
            {routine.exercises.map((workoutExercise, index) => (
              <div
                key={workoutExercise.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    {index + 1}.
                  </span>
                  <span className="font-medium text-gray-900">{workoutExercise.exercise.name}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {workoutExercise.targetSets} × {workoutExercise.targetReps || 0} reps
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Workout - Current Exercise */}
      {isWorkoutActive && currentExercise && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-gray-500">
                Exercise {currentExerciseIndex + 1} of {routine.exercises.length}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {currentExercise.exercise.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">Sets Completed</span>
              <p className="text-2xl font-bold text-blue-600">
                {getCompletedSetsCount(currentExercise.exerciseId)} / {currentExercise.targetSets}
              </p>
            </div>
          </div>

          {/* Sets */}
          <div className="space-y-3">
            {getSetsForExercise(currentExercise.exerciseId).map((setLog) => (
              <div
                key={`${setLog.exerciseId}-${setLog.setNumber}`}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                  setLog.completed
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-gray-900">
                    Set {setLog.setNumber}
                  </span>
                  <input
                    type="number"
                    value={setLog.reps}
                    onChange={(e) =>
                      setSetLogs((prev) =>
                        prev.map((log) =>
                          log.exerciseId === setLog.exerciseId &&
                          log.setNumber === setLog.setNumber
                            ? { ...log, reps: parseInt(e.target.value) || 0 }
                            : log
                        )
                      )
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Reps"
                  />
                  <span className="text-sm text-gray-600">reps</span>
                  <input
                    type="number"
                    value={setLog.weight}
                    onChange={(e) =>
                      setSetLogs((prev) =>
                        prev.map((log) =>
                          log.exerciseId === setLog.exerciseId &&
                          log.setNumber === setLog.setNumber
                            ? { ...log, weight: parseFloat(e.target.value) || 0 }
                            : log
                        )
                      )
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Weight"
                  />
                  <span className="text-sm text-gray-600">lbs</span>
                </div>

                {setLog.completed ? (
                  <button
                    onClick={() => uncompleteSet(setLog.exerciseId, setLog.setNumber)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X size={18} />
                    Undo
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleLogSet(setLog.exerciseId, setLog.setNumber, setLog.reps, setLog.weight)
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check size={18} />
                    Complete
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {currentExerciseIndex > 0 && (
              <button
                onClick={() => setCurrentExerciseIndex((prev) => prev - 1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous Exercise
              </button>
            )}
            {!isLastExercise && (
              <button
                onClick={() => setCurrentExerciseIndex((prev) => prev + 1)}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Exercise
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {isWorkoutActive && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Workout Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="How did the workout feel? Any observations?"
          />
        </div>
      )}

      {/* Action Buttons */}
      {isWorkoutActive && (
        <div className="flex gap-3">
          <button
            onClick={cancelWorkout}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel Workout
          </button>
          <button
            onClick={finishWorkout}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Check size={20} />
            {saving ? 'Saving...' : 'Finish Workout'}
          </button>
        </div>
      )}
    </div>
  );
}