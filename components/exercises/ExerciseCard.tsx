'use client';

import { Dumbbell, Target } from 'lucide-react';
import type { Exercise } from '@/models/Exercise';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
  selectionMode?: boolean;
}

export default function ExerciseCard({ exercise, onClick, selectionMode = false }: ExerciseCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
        selectionMode ? 'border-2 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{exercise.name}</h3>
          <div className="mt-1 text-xs text-gray-500">
            {exercise.source === 'admin'
              ? 'Created by Workout App Team'
              : exercise.creator_name
              ? `Created by ${exercise.creator_name}`
              : null}
          </div>
          {exercise.category && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              {exercise.category}
            </span>
          )}
        </div>
        <Dumbbell className="w-6 h-6 text-gray-400" />
      </div>

      {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Target className="w-4 h-4" />
            <span className="font-medium">Target Muscles:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {exercise.muscle_groups.map((muscle, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}

      {exercise.equipment_needed && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">Equipment:</span> {exercise.equipment_needed}
        </p>
      )}

      {selectionMode && (
        <div className="mt-4 text-center">
          <span className="text-sm font-medium text-blue-600">Click to select</span>
        </div>
      )}
    </div>
  );
}
