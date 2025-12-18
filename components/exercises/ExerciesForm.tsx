'use client';
// components/forms/ExerciseForm.tsx
import BasicForm from "../UI/BasicForm";
import { Input } from "../UI/Input";
import Select from "../UI/Select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Exercise } from "@/models/Exercise";
import { useCreateExercise, useUpdateExercise } from "@/lib/queries/useExercises";

interface ExerciseFormProps {
  exercise?: Exercise;
  onSuccess?: () => void;
}

// Dropdown options - Updated to match your model
const CATEGORIES = ['strength', 'cardio', 'flexibility', 'balance', 'sports', 'other'];
const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const EQUIPMENT = ['Barbell', 'Dumbbell', 'Bodyweight', 'Machine', 'Cable', 'Resistance Band', 'None'];

export default function ExerciseForm({ exercise, onSuccess }: ExerciseFormProps) {
  const [error, setError] = useState('');
  const router = useRouter();

  const isEditMode = !!exercise;

  // TanStack Query mutations
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();

  const loading = createExercise.isPending || updateExercise.isPending;

  async function handleExercise(formData: FormData) {
    setError('');

    try {
      // Extract form data - matching your model's field names
      const exerciseData = {
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        primaryMuscles: [formData.get('muscle_groups') as string], // Convert to array
        equipment: formData.get('equipment_needed') as string,
        instructions: formData.get('instructions') as string,
        imageUrl: formData.get('demo_video_url') as string || undefined,
      };

      if (isEditMode && exercise?.id) {
        await updateExercise.mutateAsync({
          id: exercise.id,
          data: exerciseData as any,
        });
      } else {
        await createExercise.mutateAsync(exerciseData as any);
      }

      // Success! Handle redirect or callback
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Exercise' : 'Create Exercise'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode ? 'Update exercise details' : 'Add a new exercise to your library'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <BasicForm onSubmit={handleExercise}>
        <Input
          label="Exercise Name"
          name="name"
          type="text"
          placeholder="e.g., Barbell Bench Press"
          required
          defaultValue={exercise?.name}
        />

        <Select
          label="Category"
          name="category"
          options={CATEGORIES}
          placeholder="Select a category"
          required
          defaultValue={exercise?.category || undefined}
        />

        <Select
          label="Primary Muscle Group"
          name="muscle_groups"
          options={MUSCLE_GROUPS}
          placeholder="Select primary muscle group"
          required
          defaultValue={exercise?.muscle_groups?.[0] || undefined}
        />

        <Select
          label="Equipment Needed"
          name="equipment_needed"
          options={EQUIPMENT}
          placeholder="Select equipment needed"
          required
          defaultValue={exercise?.equipment_needed || undefined}
        />

        <Input
          label="Video URL (Optional)"
          name="demo_video_url"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          defaultValue={exercise?.demo_video_url || undefined}
        />

        <div className="mb-4">
          <label 
            htmlFor="description"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Brief description of the exercise..."
            defaultValue={exercise?.description || undefined}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label 
            htmlFor="instructions"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={6}
            placeholder="Describe how to perform this exercise step by step..."
            required
            defaultValue={exercise?.instructions || undefined}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Exercise' : 'Create Exercise'}
          </button>
        </div>
      </BasicForm>
    </div>
  );
}