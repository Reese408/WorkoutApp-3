'use client';

import React from 'react';
import { Dumbbell, Timer } from 'lucide-react';

interface ExerciseTimerProps {
  timeRemaining: number;
  totalTime: number;
  exerciseName: string;
  currentSet: number;
  totalSets: number;
  isPaused: boolean;
}

export default function ExerciseTimer({
  timeRemaining,
  totalTime,
  exerciseName,
  currentSet,
  totalSets,
  isPaused
}: ExerciseTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  const isLowTime = timeRemaining < 60 && !isPaused;
  const setsRemaining = totalSets - currentSet + 1;

  return (
    <div className={`p-4 rounded-lg transition-colors ${
      isPaused ? 'bg-gray-100' : 
      isLowTime ? 'bg-orange-50' : 
      'bg-purple-50'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell size={16} className={
              isPaused ? 'text-gray-500' : 
              isLowTime ? 'text-orange-600' : 
              'text-purple-600'
            } />
            <span className={`font-semibold ${
              isPaused ? 'text-gray-700' : 
              isLowTime ? 'text-orange-900' : 
              'text-purple-900'
            }`}>
              {exerciseName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="px-2 py-0.5 bg-white rounded-full text-xs font-medium">
              Set {currentSet} of {totalSets}
            </span>
            {setsRemaining > 1 && (
              <span className="text-xs">
                ({setsRemaining - 1} remaining)
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          {isPaused && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Timer size={12} />
              <span>Paused</span>
            </div>
          )}
          <span className={`text-2xl font-bold ${
            isPaused ? 'text-gray-700' : 
            isLowTime ? 'text-orange-900' : 
            'text-purple-900'
          }`}>
            {formatTime(timeRemaining)}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            / {formatTime(totalTime)}
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isPaused ? 'bg-gray-500' : 
            isLowTime ? 'bg-orange-600' : 
            'bg-purple-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Warning for low time */}
      {isLowTime && (
        <p className="text-xs text-orange-700 mt-2 font-medium">
          ⏰ Less than 1 minute left! {setsRemaining > 1 ? `${setsRemaining - 1} sets to go!` : 'Last set!'}
        </p>
      )}
    </div>
  );
}