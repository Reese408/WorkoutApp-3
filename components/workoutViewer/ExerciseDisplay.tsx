'use client';

import React, { useState } from 'react';
import { PlayCircle, Dumbbell, Target, Info } from 'lucide-react';

interface ExerciseDisplayProps {
  exerciseName: string;
  description: string | null;
  instructions: string | null;
  videoUrl: string | null;
  muscleGroup: string | null;
  equipmentNeeded: string | null;
  targetSets: number;
  targetReps: number;
  targetWeight: number | null;
  currentSet: number;
  isSuperset: boolean;
  supersetPosition?: number;
  supersetTotal?: number;
}

export default function ExerciseDisplay({
  exerciseName,
  description,
  instructions,
  videoUrl,
  muscleGroup,
  equipmentNeeded,
  targetSets,
  targetReps,
  targetWeight,
  currentSet,
  isSuperset,
  supersetPosition = 1,
  supersetTotal = 1
}: ExerciseDisplayProps) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isSuperset && (
                <span className="px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded">
                  SUPERSET {supersetPosition}/{supersetTotal}
                </span>
              )}
              <span className="px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded">
                SET {currentSet}/{targetSets}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{exerciseName}</h2>
          </div>
          
          {videoUrl && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              <PlayCircle size={20} />
              <span>Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Section */}
      {showVideo && videoUrl && (
        <div className="bg-black aspect-video">
          <iframe
            src={videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Exercise Details */}
      <div className="p-6 space-y-6">
        {/* Target Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
            <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-600 font-medium mb-1">Target Reps</p>
            <p className="text-2xl font-bold text-blue-900">{targetReps}</p>
          </div>
          
          {targetWeight && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
              <Dumbbell className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-600 font-medium mb-1">Weight</p>
              <p className="text-2xl font-bold text-purple-900">{targetWeight} lbs</p>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
            <Info className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-600 font-medium mb-1">Total Sets</p>
            <p className="text-2xl font-bold text-green-900">{targetSets}</p>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          </div>
        )}

        {/* Instructions */}
        {instructions && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Instructions</h3>
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {instructions}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="flex flex-wrap gap-3">
          {muscleGroup && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {muscleGroup}
            </div>
          )}
          {equipmentNeeded && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
              <Dumbbell size={14} />
              {equipmentNeeded}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
