'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateExercise, useUpdateExercise } from "@/hooks/use-exercises";

interface ExerciseFormProps {
  exercise?: any;
  onSuccess?: () => void;
}

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'balance', 'sports', 'other'];
const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const EQUIPMENT = ['Barbell', 'Dumbbell', 'Bodyweight', 'Machine', 'Cable', 'Resistance Band', 'None'];

export default function ExerciseForm({ exercise, onSuccess }: ExerciseFormProps) {
  const [error, setError] = useState('');
  const router = useRouter();

  const isEditMode = !!exercise;

  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();

  const loading = createExercise.isPending || updateExercise.isPending;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const exerciseData = {
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        muscleGroups: [formData.get('muscleGroups') as string],
        isPublic: true,
        equipmentNeeded: formData.get('equipmentNeeded') as string || undefined,
        instructions: formData.get('instructions') as string || undefined,
        videoUrl: formData.get('videoUrl') as string || undefined,
      };

      if (isEditMode && exercise?.id) {
        const result = await updateExercise.mutateAsync({
          id: exercise.id,
          data: exerciseData,
        });
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await createExercise.mutateAsync(exerciseData);
        if (!result.success) throw new Error(result.error);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/exercises');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Exercise' : 'Create Exercise'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isEditMode ? 'Update exercise details' : 'Add a new exercise to your library'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name" className="text-gray-900 dark:text-gray-100">Exercise Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="e.g., Barbell Bench Press"
            required
            defaultValue={exercise?.name}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-gray-900 dark:text-gray-100">Category *</Label>
          <select
            id="category"
            name="category"
            required
            defaultValue={exercise?.category || ''}
            className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="muscleGroups" className="text-gray-900 dark:text-gray-100">Primary Muscle Group *</Label>
          <select
            id="muscleGroups"
            name="muscleGroups"
            required
            defaultValue={exercise?.muscleGroups?.[0] || ''}
            className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select muscle group</option>
            {MUSCLE_GROUPS.map((muscle) => (
              <option key={muscle} value={muscle}>{muscle}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="equipmentNeeded" className="text-gray-900 dark:text-gray-100">Equipment Needed</Label>
          <select
            id="equipmentNeeded"
            name="equipmentNeeded"
            defaultValue={exercise?.equipmentNeeded || ''}
            className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select equipment</option>
            {EQUIPMENT.map((equip) => (
              <option key={equip} value={equip}>{equip}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="videoUrl" className="text-gray-900 dark:text-gray-100">Video URL (Optional)</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            defaultValue={exercise?.videoUrl}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="instructions" className="text-gray-900 dark:text-gray-100">Instructions *</Label>
          <textarea
            id="instructions"
            name="instructions"
            rows={6}
            placeholder="Describe how to perform this exercise step by step..."
            required
            defaultValue={exercise?.instructions}
            className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Exercise' : 'Create Exercise'}
          </button>
        </div>
      </form>
    </div>
  );
}