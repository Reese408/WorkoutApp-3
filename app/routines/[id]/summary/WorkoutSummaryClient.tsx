'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Dumbbell, Clock, ChevronRight, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SetLog {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    category: string;
    muscleGroups: string[];
  };
}

interface WorkoutSummaryClientProps {
  workoutName: string;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  durationMinutes: number;
  exerciseGroups: Record<string, SetLog[]>;
  workoutLogId: string;
  routineId: string | null;
  isCompleted: boolean;
}

export default function WorkoutSummaryClient({
  workoutName,
  totalSets,
  totalReps,
  totalVolume,
  durationMinutes,
  exerciseGroups,
  routineId,
  isCompleted,
}: WorkoutSummaryClientProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${
          isCompleted
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-blue-500 to-purple-600'
        } text-white`}
      >
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {isCompleted ? (
              <Trophy className="w-24 h-24 mx-auto mb-4" />
            ) : (
              <Dumbbell className="w-24 h-24 mx-auto mb-4" />
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold mb-2"
          >
            {isCompleted ? 'Workout Complete! 🎉' : 'Workout Summary'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={isCompleted ? 'text-green-100 text-lg' : 'text-blue-100 text-lg'}
          >
            {workoutName}
          </motion.p>
          {!isCompleted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-blue-200 text-sm mt-2"
            >
              In Progress - Continue from workout history
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700"
          >
            <Dumbbell className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Volume</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalVolume.toLocaleString()}
              <span className="text-lg text-gray-500 dark:text-gray-400"> lbs</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700"
          >
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sets Completed</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalSets}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700"
          >
            <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Reps</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalReps}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700"
          >
            <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {durationMinutes}
              <span className="text-lg text-gray-500 dark:text-gray-400"> min</span>
            </p>
          </motion.div>
        </div>

        {/* Exercise Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Dumbbell className="w-6 h-6" />
            Exercise Breakdown
          </h2>
          <div className="space-y-6">
            {Object.entries(exerciseGroups).map(([exerciseName, sets], idx) => (
              <motion.div
                key={exerciseName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {exerciseName}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {sets.length} sets
                  </span>
                </div>

                {/* Muscle Groups */}
                {sets[0]?.exercise.muscleGroups && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {sets[0].exercise.muscleGroups.map((muscle) => (
                      <span
                        key={muscle}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sets.map((set, setIdx) => (
                    <div
                      key={set.id}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          SET {set.setNumber}
                        </span>
                        {setIdx === 0 && sets.length > 0 && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {set.reps || 0} reps
                      </p>
                      {set.weight && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          @ {set.weight} lbs
                        </p>
                      )}
                      {set.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic line-clamp-2">
                          {set.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`grid grid-cols-1 ${routineId ? 'sm:grid-cols-2' : ''} gap-4 pb-8`}
        >
          {routineId && (
            <Button
              onClick={() => router.push(`/routines/${routineId}/execute`)}
              variant={isCompleted ? "outline" : "default"}
              size="lg"
              className={`h-14 gap-2 ${
                !isCompleted
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  : ''
              }`}
            >
              {isCompleted ? (
                <>
                  <Repeat className="w-5 h-5" />
                  Do It Again
                </>
              ) : (
                <>
                  <Dumbbell className="w-5 h-5" />
                  Continue Workout
                </>
              )}
            </Button>
          )}

          <Button
            onClick={() => router.push('/workouts/history')}
            size="lg"
            variant={isCompleted ? "default" : "outline"}
            className={`h-14 gap-2 ${
              isCompleted
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : ''
            }`}
          >
            View Workout History
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
