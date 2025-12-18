'use client';

import React, { useState } from 'react';
import { CheckCircle, Plus, Minus } from 'lucide-react';

interface SetLoggerProps {
  targetReps: number;
  targetWeight: number | null;
  onLogSet: (reps: number, weight: number | null, rpe: number | null, notes: string) => void;
  isLoading?: boolean;
}

export default function SetLogger({ 
  targetReps, 
  targetWeight, 
  onLogSet,
  isLoading = false 
}: SetLoggerProps) {
  const [reps, setReps] = useState(targetReps);
  const [weight, setWeight] = useState(targetWeight || 0);
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = () => {
    onLogSet(
      reps, 
      targetWeight !== null ? weight : null, 
      rpe, 
      notes.trim() || ''
    );
    
    // Reset for next set (keep weight, reset notes/rpe)
    setReps(targetReps);
    setRpe(null);
    setNotes('');
  };

  const adjustReps = (delta: number) => {
    setReps(prev => Math.max(0, prev + delta));
  };

  const adjustWeight = (delta: number) => {
    setWeight(prev => Math.max(0, prev + delta));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Log This Set</h3>
      
      {/* Reps Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reps Completed
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => adjustReps(-1)}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <Minus size={18} />
          </button>
          
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value) || 0)}
            className="flex-1 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg py-3 focus:border-blue-500 focus:outline-none"
            disabled={isLoading}
          />
          
          <button
            onClick={() => adjustReps(1)}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Weight Input (if exercise has target weight) */}
      {targetWeight !== null && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight Used (lbs)
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustWeight(-5)}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <Minus size={18} />
            </button>
            
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              step="5"
              className="flex-1 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg py-3 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
            
            <button
              onClick={() => adjustWeight(5)}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-3"
        disabled={isLoading}
      >
        {showAdvanced ? '- Hide' : '+ Add'} RPE & Notes
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 mb-4">
          {/* RPE Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RPE (Rate of Perceived Exertion)
            </label>
            <div className="flex gap-2">
              {[...Array(10)].map((_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    onClick={() => setRpe(rpe === value ? null : value)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      rpe === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isLoading}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              1 = Very Easy, 10 = Maximum Effort
            </p>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did this set feel?"
              rows={2}
              className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        <CheckCircle size={20} />
        <span>{isLoading ? 'Logging...' : 'Complete Set'}</span>
      </button>
    </div>
  );
}
