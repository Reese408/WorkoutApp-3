'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface WorkoutTimerProps {
  timeRemaining: number;  // seconds
  totalTime: number;      // seconds
}

export default function WorkoutTimer({ timeRemaining, totalTime }: WorkoutTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  const isLowTime = timeRemaining < 300; // Less than 5 minutes
  const isCritical = timeRemaining < 60; // Less than 1 minute

  return (
    <div className={`p-4 rounded-lg transition-colors ${
      isCritical ? 'bg-red-100 animate-pulse' : 
      isLowTime ? 'bg-orange-50' : 
      'bg-blue-50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock size={18} className={
            isCritical ? 'text-red-600' : 
            isLowTime ? 'text-orange-600' : 
            'text-blue-600'
          } />
          <span className={`text-sm font-medium ${
            isCritical ? 'text-red-700' : 
            isLowTime ? 'text-orange-700' : 
            'text-blue-700'
          }`}>
            Total Workout Time
          </span>
        </div>
        <span className={`text-xl font-bold ${
          isCritical ? 'text-red-900' : 
          isLowTime ? 'text-orange-900' : 
          'text-blue-900'
        }`}>
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${
            isCritical ? 'bg-red-600' : 
            isLowTime ? 'bg-orange-600' : 
            'bg-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Warning messages */}
      {isCritical && (
        <p className="text-xs text-red-700 mt-2 font-semibold animate-pulse">
          🚨 Less than 1 minute remaining!
        </p>
      )}
      {isLowTime && !isCritical && (
        <p className="text-xs text-orange-700 mt-2">
          ⚠️ 5 minutes left - wrap it up!
        </p>
      )}
    </div>
  );
}