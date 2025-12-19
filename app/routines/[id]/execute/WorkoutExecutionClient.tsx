'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Trophy,
  Clock,
  Dumbbell,
  TrendingUp,
  Play,
  Pause,
  SkipForward,
  AlertCircle,
  Loader2,
  Plus,
  Minus
} from 'lucide-react';
import { startWorkout, logSet, completeWorkout, getExercisePRs } from '@/app/actions/workouts';
import type { WorkoutExerciseWithExercise } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface CompletedSet {
  exerciseId: string;
  setNumber: number;
  supersetPosition: number;
}

interface ExercisePR {
  weight: number;
  reps: number;
  date: Date;
}

export default function WorkoutExecutionClient({
  workoutId,
  workoutTitle
}: {
  workoutId: string;
  workoutTitle: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // State
  const [exercises, setExercises] = useState<WorkoutExerciseWithExercise[]>([]);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingSet, setIsLoggingSet] = useState(false);

  // PR tracking
  const [exercisePRs, setExercisePRs] = useState<Record<string, ExercisePR | null>>({});

  // Timer state
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isRestPaused, setIsRestPaused] = useState(false);

  // Set logging inputs
  const [currentReps, setCurrentReps] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [currentNotes, setCurrentNotes] = useState('');

  // Dialogs
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  // Load workout and start execution
  useEffect(() => {
    async function initWorkout() {
      try {
        setIsLoading(true);
        const result = await startWorkout({ routineId: workoutId });

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to start workout');
        }

        setWorkoutLogId(result.data.id);
        const workoutExercises = result.data.routine?.exercises || [];
        setExercises(workoutExercises);

        // Load PRs for all exercises
        const exerciseIds = workoutExercises.map(ex => ex.exerciseId);
        const prResult = await getExercisePRs(exerciseIds);
        if (prResult.success && prResult.data) {
          setExercisePRs(prResult.data);
        }

        // Check if resuming - find where to continue from
        const existingSetLogs = result.data.setLogs || [];
        if (existingSetLogs.length > 0) {
          // User is resuming - figure out current exercise and set
          setIsResuming(true);
          const completedSetsList = existingSetLogs.map((setLog: any) => ({
            exerciseId: setLog.exerciseId,
            setNumber: setLog.setNumber,
            supersetPosition: 1
          }));
          setCompletedSets(completedSetsList);

          // Find the last exercise worked on
          const lastSet = existingSetLogs[existingSetLogs.length - 1];
          const lastExerciseIndex = workoutExercises.findIndex(
            (ex: any) => ex.exerciseId === lastSet.exerciseId
          );

          if (lastExerciseIndex !== -1) {
            setCurrentExerciseIndex(lastExerciseIndex);

            // Find how many sets completed for this exercise
            const setsForExercise = existingSetLogs.filter(
              (log: any) => log.exerciseId === lastSet.exerciseId
            );
            const nextSet = setsForExercise.length + 1;
            setCurrentSetNumber(nextSet);

            // If all sets done, move to next exercise
            if (nextSet > workoutExercises[lastExerciseIndex].targetSets) {
              const nextExerciseIndex = lastExerciseIndex + 1;
              if (nextExerciseIndex < workoutExercises.length) {
                setCurrentExerciseIndex(nextExerciseIndex);
                setCurrentSetNumber(1);
                setCurrentReps(workoutExercises[nextExerciseIndex].targetReps || 10);
              }
            } else {
              setCurrentReps(workoutExercises[lastExerciseIndex].targetReps || 10);
            }
          }
        } else {
          // Brand new workout - start from beginning
          if (workoutExercises.length > 0) {
            setCurrentReps(workoutExercises[0].targetReps || 10);
          }
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workout');
        setIsLoading(false);
      }
    }

    initWorkout();
  }, [workoutId]);

  // Workout timer
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      setWorkoutElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Rest timer
  useEffect(() => {
    if (!isResting || isRestPaused || restTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev <= 1) {
          handleRestComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, isRestPaused, restTimeRemaining]);

  const getCurrentExerciseInfo = () => {
    if (exercises.length === 0) return null;
    const currentExercise = exercises[currentExerciseIndex];

    if (currentExercise.supersetGroup !== null && currentExercise.supersetGroup !== undefined) {
      const supersetExercises = exercises.filter(
        ex => ex.supersetGroup === currentExercise.supersetGroup
      );

      return {
        exercise: currentExercise,
        isSuperset: true,
        supersetExercises,
        supersetTotal: supersetExercises.length
      };
    }

    return {
      exercise: currentExercise,
      isSuperset: false,
      supersetExercises: [currentExercise],
      supersetTotal: 1
    };
  };

  const isCurrentSetCompleted = () => {
    const info = getCurrentExerciseInfo();
    if (!info) return false;

    return completedSets.some(
      set =>
        set.exerciseId === info.exercise.exerciseId &&
        set.setNumber === currentSetNumber
    );
  };

  const handleLogSet = async () => {
    if (!workoutLogId || currentReps === 0) return;

    const info = getCurrentExerciseInfo();
    if (!info) return;

    try {
      setIsLoggingSet(true);
      const result = await logSet(workoutLogId, {
        exerciseId: info.exercise.exerciseId,
        setNumber: currentSetNumber,
        reps: currentReps,
        weight: currentWeight > 0 ? currentWeight : undefined,
        notes: currentNotes || undefined,
        completed: true,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to log set');
      }

      setCompletedSets(prev => [
        ...prev,
        {
          exerciseId: info.exercise.exerciseId,
          setNumber: currentSetNumber,
          supersetPosition: 1
        }
      ]);

      // Clear notes after logging
      setCurrentNotes('');

      // Move to next
      if (currentSetNumber < info.exercise.targetSets) {
        // Start rest
        const restSeconds = info.exercise.restPeriod || 90;
        setRestTimeRemaining(restSeconds);
        setIsResting(true);
        setCurrentSetNumber(prev => prev + 1);
      } else {
        // Move to next exercise
        moveToNextExercise();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log set');
    } finally {
      setIsLoggingSet(false);
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    setRestTimeRemaining(0);
    setIsRestPaused(false);
  };

  const handleSkipRest = () => {
    handleRestComplete();
  };

  const moveToNextExercise = () => {
    const nextIndex = currentExerciseIndex + 1;

    if (nextIndex >= exercises.length) {
      handleCompleteWorkout();
    } else {
      setCurrentExerciseIndex(nextIndex);
      setCurrentSetNumber(1);
      setCurrentReps(exercises[nextIndex].targetReps || 10);
      setCurrentWeight(0);
    }
  };

  const handleCompleteWorkout = async () => {
    if (!workoutLogId) return;

    try {
      startTransition(async () => {
        const result = await completeWorkout({
          workoutId: workoutLogId,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to complete workout');
        }

        router.push(`/routines/${workoutId}/summary?log=${workoutLogId}`);
      });
    } catch (err) {
      setError('Failed to complete workout');
    }
  };

  const calculateProgress = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.targetSets, 0);
    const completed = completedSets.length;
    return totalSets > 0 ? Math.round((completed / totalSets) * 100) : 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading workout...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{error}</p>
          <Button
            onClick={() => router.push('/routines')}
            className="w-full"
          >
            Back to Routines
          </Button>
        </motion.div>
      </div>
    );
  }

  const info = getCurrentExerciseInfo();
  if (!info) return null;

  const progress = calculateProgress();
  const currentPR = exercisePRs[info.exercise.exerciseId];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{workoutTitle}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuitDialog(true)}
            >
              Save & Exit
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-semibold text-gray-900 dark:text-white">{progress}%</span>
            </div>
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              />
            </div>
          </div>

          {/* Workout Timer */}
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
            <Clock className="w-5 h-5" />
            <span className="text-lg font-semibold">{formatTime(workoutElapsedSeconds)}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Resume Banner */}
        {isResuming && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Play className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Resuming Workout</h3>
                <p className="text-sm text-blue-100">Picking up where you left off!</p>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div
              key="rest"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {/* Rest Timer Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-8 shadow-xl border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                    <Pause className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rest Time</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Get ready for set {currentSetNumber}
                  </p>

                  <motion.div
                    key={restTimeRemaining}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-7xl font-bold text-green-600 dark:text-green-400 mb-8"
                  >
                    {formatTime(restTimeRemaining)}
                  </motion.div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setIsRestPaused(!isRestPaused)}
                      className="gap-2"
                    >
                      {isRestPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {isRestPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button
                      onClick={handleSkipRest}
                      className="gap-2"
                    >
                      <SkipForward className="w-4 h-4" />
                      Skip Rest
                    </Button>
                  </div>
                </div>
              </div>

              {/* Next Exercise Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">NEXT</h4>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {info.exercise.exercise.name} - Set {currentSetNumber}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Exercise Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                {/* Exercise Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2">{info.exercise.exercise.name}</h2>
                      <p className="text-blue-100">
                        {info.exercise.exercise.muscleGroups?.join(', ')}
                      </p>
                    </div>
                    {currentPR && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center"
                      >
                        <Trophy className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs font-semibold">PR</div>
                        <div className="text-sm font-bold">{currentPR.weight}lb × {currentPR.reps}</div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Set Progress */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      SET PROGRESS
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentSetNumber} / {info.exercise.targetSets}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {Array.from({ length: info.exercise.targetSets }).map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex-1 h-2 rounded-full ${
                          idx < currentSetNumber - 1
                            ? 'bg-green-500'
                            : idx === currentSetNumber - 1
                            ? 'bg-blue-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Input Section */}
                {!isCurrentSetCompleted() && (
                  <div className="p-6 space-y-6">
                    {/* Reps Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        REPS
                        {info.exercise.targetReps && (
                          <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">
                            (Target: {info.exercise.targetReps})
                          </span>
                        )}
                      </label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentReps(Math.max(0, currentReps - 1))}
                          disabled={currentReps === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <input
                          type="number"
                          value={currentReps}
                          onChange={(e) => setCurrentReps(Math.max(0, parseInt(e.target.value) || 0))}
                          className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 text-center text-4xl font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentReps(currentReps + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Weight Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        WEIGHT (lbs) - Optional
                      </label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentWeight(Math.max(0, currentWeight - 5))}
                          disabled={currentWeight === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <input
                          type="number"
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 text-center text-4xl font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          min="0"
                          step="2.5"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentWeight(currentWeight + 5)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        NOTES (Optional)
                      </label>
                      <textarea
                        value={currentNotes}
                        onChange={(e) => setCurrentNotes(e.target.value)}
                        placeholder="How did it feel? Any pain?"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Complete Set Button */}
                    <Button
                      onClick={handleLogSet}
                      disabled={isLoggingSet || currentReps === 0}
                      className="w-full h-14 text-lg font-semibold gap-3"
                      size="lg"
                    >
                      {isLoggingSet ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Logging...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Complete Set
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {isCurrentSetCompleted() && (
                  <div className="p-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-2xl p-6 text-center"
                    >
                      <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-3" />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Set Complete!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Great work! Get ready for the next one.
                      </p>
                    </motion.div>
                  </div>
                )}

                {/* Exercise Instructions */}
                {info.exercise.exercise.instructions && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      INSTRUCTIONS
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {info.exercise.exercise.instructions}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quit Dialog */}
      <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save & Exit?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved. You can continue this workout later from the workout history page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Workout</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/workouts/history')}>
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
