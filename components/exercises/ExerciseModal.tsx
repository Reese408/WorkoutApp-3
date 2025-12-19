'use client';

import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import type { Exercise, ExerciseFormData } from '@/lib/types';
import { createExercise, updateExercise, deleteExercise } from '@/app/actions/exercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExerciseModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export default function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: exercise?.name || '',
    category: exercise?.category || '',
    muscleGroups: exercise?.muscleGroups || [],
    equipmentNeeded: exercise?.equipmentNeeded || '',
    instructions: exercise?.instructions || '',
    videoUrl: exercise?.videoUrl || '',
    demoGifUrl: exercise?.demoGifUrl || '',
    isPublic: exercise?.isPublic ?? true,
  });
  const [muscleGroupsInput, setMuscleGroupsInput] = useState(
    exercise?.muscleGroups?.join(', ') || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!exercise;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Parse muscle groups from comma-separated string
      const muscleGroups = muscleGroupsInput
        .split(',')
        .map((mg) => mg.trim())
        .filter((mg) => mg.length > 0);

      const exerciseData: ExerciseFormData = {
        ...formData,
        muscleGroups,
      };

      let result;
      if (isEditMode && exercise) {
        result = await updateExercise(exercise.id, exerciseData);
      } else {
        result = await createExercise(exerciseData);
      }

      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to save exercise');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!exercise || !confirm('Are you sure you want to delete this exercise?')) return;

    setLoading(true);
    try {
      const result = await deleteExercise(exercise.id);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to delete exercise');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isEditMode ? 'Edit Exercise' : 'Create Exercise'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name">Exercise Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Barbell Bench Press"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="balance">Balance</option>
              <option value="plyometric">Plyometric</option>
            </select>
          </div>

          <div>
            <Label htmlFor="muscleGroups">Muscle Groups (comma-separated)</Label>
            <Input
              id="muscleGroups"
              type="text"
              value={muscleGroupsInput}
              onChange={(e) => setMuscleGroupsInput(e.target.value)}
              placeholder="e.g., chest, triceps, shoulders"
            />
          </div>

          <div>
            <Label htmlFor="equipment">Equipment Needed</Label>
            <Input
              id="equipment"
              type="text"
              value={formData.equipmentNeeded || ''}
              onChange={(e) => setFormData({ ...formData, equipmentNeeded: e.target.value })}
              placeholder="e.g., Barbell, Bench"
            />
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <textarea
              id="instructions"
              value={formData.instructions || ''}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe how to perform this exercise..."
            />
          </div>

          <div>
            <Label htmlFor="videoUrl">Demo Video URL</Label>
            <Input
              id="videoUrl"
              type="url"
              value={formData.videoUrl || ''}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <div>
              {isEditMode && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
