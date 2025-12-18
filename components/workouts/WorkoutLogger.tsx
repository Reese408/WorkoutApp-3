'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Check, X, Clock, Dumbbell } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkoutExercise {
  id: string;
  exerciseName: string;
  sets: number;
  reps: number;
  timeMinutes: number;
  order: number;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  totalTime: number;
}

interface SetLog {
  exerciseId: string;
  setNumber: number;
  reps: number;
  completed: boolean;
}

export default function WorkoutLogger({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [setLogs, setSetLogs] = useState<SetLog[]>([]);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch workout data
  useEffect(() => {
    fetchWorkout();
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

  const fetchWorkout = async () => {
    try {
      const response = await fetch(`/api/workout-routines/${workoutId}`);
      if (!response.ok) throw new Error('Failed to fetch workout');
      
      const data = await response.json();
      setWorkout(data.workout);

      // Initialize set logs
      const logs: SetLog[] = [];
      data.workout.exercises.forEach((exercise: WorkoutExercise) => {
        for (let i = 1; i <= exercise.sets; i++) {
          logs.push({
            exerciseId: exercise.id,
            setNumber: i,
            reps: exercise.reps,
            completed: false,
          });
        }
      });
      setSetLogs(logs);
    } catch (error) {
      console.error('Error fetching workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutStartTime(new Date());
    setTimer(0);
  };

  const completeSet = (exerciseId: string, setNumber: number, reps: number) => {
    setSetLogs((prev) =>
      prev.map((log) =>
        log.exerciseId === exerciseId && log.setNumber === setNumber
          ? { ...log, reps, completed: true }
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

  const finishWorkout = async () => {
    if (!workout || !workoutStartTime) return;

    setSaving(true);
    try {
      // Save workout log
      const logResponse = await fetch('/api/workout-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutId: workout.id,
          startedAt: workoutStartTime.toISOString(),
          completedAt: new Date().toISOString(),
          notes,
        }),
      });

      if (!logResponse.ok) throw new Error('Failed to save workout log');
      const logData = await logResponse.json();
      const workoutLogId = logData.workoutLog.id;

      // Save set logs
      const completedSets = setLogs.filter((log) => log.completed);
      if (completedSets.length > 0) {
        await fetch('/api/set-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutLogId,
            sets: completedSets.map((log) => ({
              exerciseId: log.exerciseId,
              setNumber: log.setNumber,
              reps: log.reps,
            })),
          }),
        });
      }

      // Redirect to workout history
      router.push('/workout-history');
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
        <p className="mt-4 text-gray-600">Loading workout...</p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Workout not found</p>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Workout Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workout.name}</h1>
            {workout.description && (
              <p className="text-gray-600 mt-1">{workout.description}</p>
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
            {workout.exercises.length} exercises
          </span>
          <span>
            {getTotalCompletedSets()} / {setLogs.length} sets completed
          </span>
        </div>

        {!isWorkoutActive && (
          <button
            onClick={startWorkout}
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
            {workout.exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    {index + 1}.
                  </span>
                  <span className="font-medium text-gray-900">{exercise.exerciseName}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {exercise.sets} × {exercise.reps} reps
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
                Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {currentExercise.exerciseName}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">Sets Completed</span>
              <p className="text-2xl font-bold text-blue-600">
                {getCompletedSetsCount(currentExercise.id)} / {currentExercise.sets}
              </p>
            </div>
          </div>

          {/* Sets */}
          <div className="space-y-3">
            {getSetsForExercise(currentExercise.id).map((setLog) => (
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
                      completeSet(setLog.exerciseId, setLog.setNumber, setLog.reps)
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