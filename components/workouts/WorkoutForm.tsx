'use client';

import { useState } from 'react';
import { Plus, Trash2, Clock, Dumbbell } from 'lucide-react';
import { useExercises } from '@/hooks/use-exercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateRoutineFormData, RoutineWithDetails, ExerciseWithCreator, WorkoutExerciseFormData } from '@/lib/types';

interface WorkoutFormProps {
  mode: 'create' | 'edit';
  initialData?: RoutineWithDetails;
  onSubmit: (data: CreateRoutineFormData) => Promise<void>;
  onCancel: () => void;
}

export default function WorkoutForm({ mode, initialData, onSubmit, onCancel }: WorkoutFormProps) {
  const [formData, setFormData] = useState<CreateRoutineFormData>(
    initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      isPublic: initialData.isPublic,
      exercises: initialData.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps ?? undefined,
        targetDuration: ex.targetDuration ?? undefined,
        restPeriod: ex.restPeriod ?? undefined,
        notes: ex.notes ?? undefined,
        supersetGroup: ex.supersetGroup ?? undefined,
        orderIndex: ex.orderIndex,
      })),
    } : {
      name: '',
      description: '',
      isPublic: true,
      exercises: [],
    }
  );

  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store exercise names for display
  const [exerciseNames, setExerciseNames] = useState<Map<string, string>>(
    new Map(initialData?.exercises.map(ex => [ex.exerciseId, ex.exercise.name]) || [])
  );

  // Calculate total workout time (estimate 3 minutes per set)
  const totalTime = formData.exercises.reduce((sum, ex) => sum + (ex.targetSets * 3), 0);

  const handleAddExercise = (exercise: ExerciseWithCreator) => {
    const newExercise: WorkoutExerciseFormData = {
      exerciseId: exercise.id,
      targetSets: 3,
      targetReps: 10,
      restPeriod: 60,
      orderIndex: formData.exercises.length,
    };

    setFormData({
      ...formData,
      exercises: [...formData.exercises, newExercise],
    });

    setExerciseNames(new Map(exerciseNames).set(exercise.id, exercise.name));
    setShowExerciseModal(false);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = formData.exercises.filter((_, i) => i !== index);
    // Reorder remaining exercises
    const reorderedExercises = updatedExercises.map((ex, i) => ({
      ...ex,
      orderIndex: i,
    }));
    setFormData({
      ...formData,
      exercises: reorderedExercises,
    });
  };

  const handleExerciseChange = (index: number, field: keyof CreateRoutineFormData['exercises'][0], value: string | number) => {
    const updatedExercises = formData.exercises.map((ex, i) => {
      if (i === index) {
        return { ...ex, [field]: value };
      }
      return ex;
    });
    setFormData({
      ...formData,
      exercises: updatedExercises,
    });
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.exercises.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedExercises = [...formData.exercises];
    const [movedExercise] = updatedExercises.splice(index, 1);
    updatedExercises.splice(newIndex, 0, movedExercise);

    // Update order values
    const reorderedExercises = updatedExercises.map((ex, i) => ({
      ...ex,
      orderIndex: i,
    }));

    setFormData({
      ...formData,
      exercises: reorderedExercises,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Workout name is required');
      return;
    }

    if (formData.exercises.length === 0) {
      setError('Add at least one exercise to the workout');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Info Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Workout Details</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workout Name *</Label>
              <Input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Upper Body Strength"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Describe your workout..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isPublic" className="text-sm font-normal cursor-pointer">
                Make this workout public
              </Label>
            </div>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Exercises</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Dumbbell size={16} />
                  {formData.exercises.length} exercises
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  ~{totalTime} minutes total
                </span>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setShowExerciseModal(true)}
            >
              <Plus size={18} className="mr-2" />
              Add Exercise
            </Button>
          </div>

          {/* Exercise List */}
          {formData.exercises.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Dumbbell size={48} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p>No exercises added yet</p>
              <p className="text-sm mt-1">Click "Add Exercise" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Order Controls */}
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(index, 'down')}
                        disabled={index === formData.exercises.length - 1}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Exercise Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                        {exerciseNames.get(exercise.exerciseId) || 'Unknown Exercise'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label htmlFor={`sets-${index}`} className="text-xs">Sets</Label>
                          <Input
                            id={`sets-${index}`}
                            type="number"
                            min="1"
                            value={exercise.targetSets}
                            onChange={(e) =>
                              handleExerciseChange(index, 'targetSets', parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`reps-${index}`} className="text-xs">Reps</Label>
                          <Input
                            id={`reps-${index}`}
                            type="number"
                            min="1"
                            value={exercise.targetReps || 0}
                            onChange={(e) =>
                              handleExerciseChange(index, 'targetReps', parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`duration-${index}`} className="text-xs">Duration (sec)</Label>
                          <Input
                            id={`duration-${index}`}
                            type="number"
                            min="0"
                            step="15"
                            value={exercise.targetDuration || 0}
                            onChange={(e) =>
                              handleExerciseChange(index, 'targetDuration', parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`rest-${index}`} className="text-xs">Rest (sec)</Label>
                          <Input
                            id={`rest-${index}`}
                            type="number"
                            min="30"
                            max="300"
                            step="15"
                            value={exercise.restPeriod || 60}
                            onChange={(e) =>
                              handleExerciseChange(index, 'restPeriod', parseInt(e.target.value) || 60)
                            }
                          />
                        </div>
                      </div>

                      {/* Notes field */}
                      <div className="mt-3">
                        <Label htmlFor={`notes-${index}`} className="text-xs">Notes (optional)</Label>
                        <Input
                          id={`notes-${index}`}
                          type="text"
                          value={exercise.notes || ''}
                          onChange={(e) =>
                            handleExerciseChange(index, 'notes', e.target.value)
                          }
                          placeholder="e.g., Focus on form, pause at top"
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove exercise"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Workout' : 'Update Workout'}
          </Button>
        </div>
      </form>

      {/* Exercise Selection Modal */}
      {showExerciseModal && (
        <ExerciseSelectionModal
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseModal(false)}
          excludedIds={formData.exercises.map((ex) => ex.exerciseId)}
        />
      )}
    </>
  );
}

// Exercise Selection Modal Component
interface ExerciseSelectionModalProps {
  onSelect: (exercise: ExerciseWithCreator) => void;
  onClose: () => void;
  excludedIds: string[];
}

function ExerciseSelectionModal({ onSelect, onClose, excludedIds }: ExerciseSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const { data, isLoading: loading, error } = useExercises();
  const exercises = data?.data || [];

  // Filter exercises
  const filteredExercises = exercises.filter((exercise) => {
    if (excludedIds.includes(exercise.id)) return false;

    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exercise.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['all', ...new Set(exercises.map((ex) => ex.category).filter(Boolean))];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Select Exercise</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <Input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterCategory === category
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading exercises...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : 'Failed to load exercises'}
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No exercises found. Try adjusting your search or filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{exercise.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {exercise.category && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        {exercise.category}
                      </span>
                    )}
                    {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        {exercise.muscleGroups[0]}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
