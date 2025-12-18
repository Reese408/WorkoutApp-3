'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ExerciseDisplay from '@/components/workoutViewer/ExerciseDisplay';
import SetLogger from '@/components/workoutViewer/SetLogger';
import RestTimer from '@/components/workoutViewer/RestTimer';
import WorkoutTimer from '@/components/workoutViewer/WorkoutTimer';
import ExerciseTimer from '@/components/workoutViewer/ExerciseTimer';
import { WorkoutExerciseWithDetails } from '@/models/WorkoutExercise';
import { useStartWorkout, useLogSet, useCompleteWorkout } from '@/lib/queries/useWorkoutExecution';

interface CompletedSet {
  exercise_id: string;
  set_number: number;
  superset_position: number;
}

// Helper function to calculate smart rest time
function calculateSmartRest(
  exerciseMinutes: number,
  sets: number,
  isSuperset: boolean = false,
  supersetExerciseCount: number = 1
): number {
  const avgWorkTimePerSet = 45;
  const totalSeconds = exerciseMinutes * 60;
  const exerciseCount = isSuperset ? supersetExerciseCount : 1;
  const totalWorkTime = sets * exerciseCount * avgWorkTimePerSet;
  const availableForRest = totalSeconds - totalWorkTime;
  const restPeriods = sets - 1;
  
  if (restPeriods <= 0) return 60;
  
  const calculatedRest = Math.floor(availableForRest / restPeriods);
  return Math.max(30, Math.min(300, calculatedRest));
}

// Helper to calculate total workout time
function calculateTotalWorkoutTime(exercises: WorkoutExerciseWithDetails[]): number {
  const supersetGroups = new Map<number, WorkoutExerciseWithDetails[]>();
  const regularExercises: WorkoutExerciseWithDetails[] = [];
  
  exercises.forEach(ex => {
    if (ex.is_superset && ex.superset_group !== undefined && ex.superset_group !== null) {
      const group = supersetGroups.get(ex.superset_group) || [];
      group.push(ex);
      supersetGroups.set(ex.superset_group, group);
    } else {
      regularExercises.push(ex);
    }
  });
  
  const regularTime = regularExercises.reduce((sum, ex) => sum + (ex.time_minutes || 5), 0);
  
  let supersetTime = 0;
  const processedGroups = new Set<number>();
  
  supersetGroups.forEach((group, groupNumber) => {
    if (!processedGroups.has(groupNumber)) {
      const groupTime = group.reduce((sum, ex) => sum + (ex.time_minutes || 5), 0);
      supersetTime += groupTime;
      processedGroups.add(groupNumber);
    }
  });
  
  return (regularTime + supersetTime) * 60; // Convert to seconds
}

export default function WorkoutExecutionClient({
  workoutId,
  workoutTitle
}: {
  workoutId: string;
  workoutTitle: string;
}) {
  const router = useRouter();

  // TanStack Query mutations
  const startWorkout = useStartWorkout();
  const logSetMutation = useLogSet();
  const completeWorkoutMutation = useCompleteWorkout();

  // State
  const [exercises, setExercises] = useState<WorkoutExerciseWithDetails[]>([]);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [currentSupersetPosition, setCurrentSupersetPosition] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer state
  const [workoutTimeRemaining, setWorkoutTimeRemaining] = useState(0);
  const [workoutTimeTotal, setWorkoutTimeTotal] = useState(0);
  const [exerciseTimeRemaining, setExerciseTimeRemaining] = useState(0);
  const [exerciseTimeTotal, setExerciseTimeTotal] = useState(0);

  // Load workout and start execution
  useEffect(() => {
    async function initWorkout() {
      try {
        const data = await startWorkout.mutateAsync(workoutId);

        setWorkoutLogId(data.workoutLogId);
        setSessionId(data.sessionId);
        setExercises(data.exercises as any);

        // Initialize workout timer
        const totalTime = calculateTotalWorkoutTime(data.exercises as any);
        setWorkoutTimeTotal(totalTime);
        setWorkoutTimeRemaining(totalTime);

        // Initialize exercise timer
        if (data.exercises.length > 0) {
          const firstExercise = data.exercises[0] as any;
          const exerciseTime = (firstExercise.time_minutes || 5) * 60;
          setExerciseTimeTotal(exerciseTime);
          setExerciseTimeRemaining(exerciseTime);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workout');
      }
    }

    initWorkout();
  }, [workoutId]);

  // Workout timer countdown
  useEffect(() => {
    if (startWorkout.isPending || workoutTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setWorkoutTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [startWorkout.isPending, workoutTimeRemaining]);

  // Exercise timer countdown (only when not resting)
  useEffect(() => {
    if (startWorkout.isPending || isResting || exerciseTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setExerciseTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [startWorkout.isPending, isResting, exerciseTimeRemaining]);

  // Reset exercise timer when moving to new exercise
  const resetExerciseTimer = useCallback((exerciseIndex: number) => {
    if (exercises.length === 0 || exerciseIndex >= exercises.length) return;
    
    const exercise = exercises[exerciseIndex];
    
    // For supersets, combine time from all exercises in the group
    if (exercise.is_superset && exercise.superset_group !== null) {
      const supersetExercises = exercises.filter(
        ex => ex.superset_group === exercise.superset_group
      );
      const totalTime = supersetExercises.reduce(
        (sum, ex) => sum + (ex.time_minutes || 5),
        0
      ) * 60;
      setExerciseTimeTotal(totalTime);
      setExerciseTimeRemaining(totalTime);
    } else {
      const time = (exercise.time_minutes || 5) * 60;
      setExerciseTimeTotal(time);
      setExerciseTimeRemaining(time);
    }
  }, [exercises]);

  // Get current exercise and superset info
  const getCurrentExerciseInfo = () => {
    if (exercises.length === 0) return null;

    const currentExercise = exercises[currentExerciseIndex];
    
    if (currentExercise.is_superset && currentExercise.superset_group !== null) {
      const supersetExercises = exercises.filter(
        ex => ex.superset_group === currentExercise.superset_group
      );
      
      const positionInSuperset = supersetExercises.findIndex(
        ex => ex.id === currentExercise.id
      ) + 1;

      return {
        exercise: currentExercise,
        isSuperset: true,
        supersetExercises,
        supersetPosition: positionInSuperset,
        supersetTotal: supersetExercises.length
      };
    }

    return {
      exercise: currentExercise,
      isSuperset: false,
      supersetExercises: [currentExercise],
      supersetPosition: 1,
      supersetTotal: 1
    };
  };

  const isCurrentSetCompleted = () => {
    const info = getCurrentExerciseInfo();
    if (!info) return false;

    return completedSets.some(
      set =>
        set.exercise_id === info.exercise.exercise_id &&
        set.set_number === currentSetNumber &&
        set.superset_position === currentSupersetPosition
    );
  };

  const handleLogSet = async (
    reps: number,
    weight: number | null,
    rpe: number | null,
    notes: string
  ) => {
    if (!workoutLogId) return;

    const info = getCurrentExerciseInfo();
    if (!info) return;

    try {
      await logSetMutation.mutateAsync({
        workoutLogId,
        exerciseId: info.exercise.exercise_id,
        setNumber: currentSetNumber,
        reps,
        weight: weight || undefined,
        notes: notes || undefined,
      });

      setCompletedSets(prev => [
        ...prev,
        {
          exercise_id: info.exercise.exercise_id,
          set_number: currentSetNumber,
          superset_position: currentSupersetPosition
        }
      ]);

      moveToNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log set');
    }
  };

  const moveToNext = () => {
    const info = getCurrentExerciseInfo();
    if (!info) return;

    // If in superset and not last exercise, move to next exercise in group
    if (info.isSuperset && currentSupersetPosition < info.supersetTotal) {
      setCurrentSupersetPosition(prev => prev + 1);
      setCurrentExerciseIndex(prev => prev + 1);
      return;
    }

    // If more sets remaining, start rest period
    if (currentSetNumber < info.exercise.target_sets) {
      setIsResting(true);
    } else {
      // Move to next exercise
      moveToNextExercise();
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    
    const info = getCurrentExerciseInfo();
    if (!info) return;

    setCurrentSetNumber(prev => prev + 1);
    
    // Reset to first exercise in superset if applicable
    if (info.isSuperset) {
      const firstSupersetIndex = exercises.findIndex(
        ex => ex.superset_group === info.exercise.superset_group
      );
      setCurrentExerciseIndex(firstSupersetIndex);
      setCurrentSupersetPosition(1);
    }
  };

  const moveToNextExercise = () => {
    const info = getCurrentExerciseInfo();
    if (!info) return;

    let nextIndex = currentExerciseIndex + 1;

    // Skip to end of superset group if in one
    if (info.isSuperset) {
      const lastSupersetIndex = exercises.findIndex(
        (ex, idx) => 
          idx > currentExerciseIndex && 
          ex.superset_group !== info.exercise.superset_group
      );
      nextIndex = lastSupersetIndex !== -1 ? lastSupersetIndex : exercises.length;
    }

    if (nextIndex >= exercises.length) {
      completeWorkout();
    } else {
      setCurrentExerciseIndex(nextIndex);
      setCurrentSetNumber(1);
      setCurrentSupersetPosition(1);
      resetExerciseTimer(nextIndex);
    }
  };

  const completeWorkout = async () => {
    if (!workoutLogId || !sessionId) return;

    try {
      await completeWorkoutMutation.mutateAsync({
        workoutLogId,
        sessionId,
      });

      router.push(`/routines/${workoutId}/summary?log=${workoutLogId}`);
    } catch (err) {
      setError('Failed to complete workout');
    }
  };

  const calculateProgress = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.target_sets, 0);
    const completed = completedSets.length;
    return Math.round((completed / totalSets) * 100);
  };

  // Calculate smart rest time
  const getSmartRestTime = (): number => {
    const info = getCurrentExerciseInfo();
    if (!info) return 60;

    // If manually set, use that
    if (info.exercise.rest_seconds) {
      return info.exercise.rest_seconds;
    }

    // Otherwise calculate smart rest
    const exerciseMinutes = info.exercise.time_minutes || 5;
    return calculateSmartRest(
      exerciseMinutes,
      info.exercise.target_sets,
      info.isSuperset,
      info.supersetTotal
    );
  };

  if (startWorkout.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Error
          </h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => router.push('/routines')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Routines
          </button>
        </div>
      </div>
    );
  }

  const info = getCurrentExerciseInfo();
  if (!info) return null;

  const progress = calculateProgress();
  const smartRestTime = getSmartRestTime();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">{workoutTitle}</h1>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to quit? Progress will be saved.')) {
                  router.push('/routines');
                }
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <XCircle size={24} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">{progress}%</span>
          </div>

          {/* Workout Timer */}
          <WorkoutTimer 
            timeRemaining={workoutTimeRemaining}
            totalTime={workoutTimeTotal}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Exercise Timer - Only show when not resting */}
        {!isResting && (
          <ExerciseTimer
            timeRemaining={exerciseTimeRemaining}
            totalTime={exerciseTimeTotal}
            exerciseName={info.exercise.exercise_name}
            currentSet={currentSetNumber}
            totalSets={info.exercise.target_sets}
            isPaused={false}
          />
        )}

        {isResting ? (
          <>
            {/* Exercise Timer (Paused) */}
            <ExerciseTimer
              timeRemaining={exerciseTimeRemaining}
              totalTime={exerciseTimeTotal}
              exerciseName={info.exercise.exercise_name}
              currentSet={currentSetNumber}
              totalSets={info.exercise.target_sets}
              isPaused={true}
            />
            
            {/* Rest Timer */}
            <RestTimer
              duration={smartRestTime}
              onComplete={handleRestComplete}
              onSkip={handleRestComplete}
            />
          </>
        ) : (
          <>
            <ExerciseDisplay
              exerciseName={info.exercise.exercise_name}
              description={null}
              instructions={info.exercise.exercise_instructions}
              videoUrl={info.exercise.exercise_demo_video_url}
              muscleGroup={info.exercise.exercise_muscle_groups?.join(', ') || null}
              equipmentNeeded={info.exercise.exercise_equipment_needed}
              targetSets={info.exercise.target_sets}
              targetReps={info.exercise.target_reps}
              targetWeight={null}
              currentSet={currentSetNumber}
              isSuperset={info.isSuperset}
              supersetPosition={info.supersetPosition}
              supersetTotal={info.supersetTotal}
            />

            {!isCurrentSetCompleted() && (
              <SetLogger
                targetReps={info.exercise.target_reps}
                targetWeight={null}
                onLogSet={handleLogSet}
                isLoading={logSetMutation.isPending}
              />
            )}

            {isCurrentSetCompleted() && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-lg font-semibold text-green-900 mb-1">
                  Set Complete!
                </p>
                <p className="text-sm text-green-700 mb-4">
                  {info.isSuperset && currentSupersetPosition < info.supersetTotal
                    ? `Moving to next exercise in superset...`
                    : currentSetNumber < info.exercise.target_sets
                    ? `Rest for ${Math.floor(smartRestTime / 60)}:${(smartRestTime % 60).toString().padStart(2, '0')}`
                    : 'Moving to next exercise...'}
                </p>
                <button
                  onClick={moveToNext}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  <span>Continue</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}