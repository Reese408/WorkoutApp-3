'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

interface RestTimerProps {
  duration: number; // Duration in seconds
  onComplete: () => void;
  onSkip: () => void;
}

export default function RestTimer({ duration, onComplete, onSkip }: RestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setTimeRemaining(duration);
    setIsPaused(false);
  }, [duration]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isPaused, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeRemaining) / duration) * 100;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 shadow-lg">
      <div className="text-center">
        <p className="text-blue-100 text-sm font-medium mb-4">REST TIME</p>
        
        {/* Circular Progress */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="white"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-white">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center justify-center w-14 h-14 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-md"
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
          
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-md font-medium"
          >
            <span>Skip Rest</span>
            <SkipForward size={20} />
          </button>
        </div>
        
        <p className="text-blue-100 text-sm mt-4">
          {isPaused ? 'Timer paused' : 'Get ready for your next set'}
        </p>
      </div>
    </div>
  );
}
