'use client';

import { Dumbbell, Target } from 'lucide-react';

interface ExerciseCardProps {
  exercise: any;
  onClick: () => void;
  selectionMode?: boolean;
}

export default function ExerciseCard({ exercise, onClick, selectionMode = false }: ExerciseCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
        selectionMode ? 'border-2 border-blue-500 dark:border-blue-400' : 'border border-transparent dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{exercise.name}</h3>
          {exercise.creator && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Created by {exercise.creator.name || exercise.creator.email}
            </div>
          )}
          {exercise.category && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded mt-2">
              {exercise.category}
            </span>
          )}
        </div>
        <Dumbbell className="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>

      {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Target className="w-4 h-4" />
            <span className="font-medium">Target Muscles:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {exercise.muscleGroups.map((muscle: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}

      {exercise.equipmentNeeded && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Equipment:</span> {exercise.equipmentNeeded}
        </p>
      )}

      {selectionMode && (
        <div className="mt-4 text-center">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Click to select</span>
        </div>
      )}
    </div>
  );
}
