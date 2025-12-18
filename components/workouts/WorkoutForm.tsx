'use client';

import { useState } from 'react';
import { Plus, Trash2, Clock, Dumbbell } from 'lucide-react';
import { useExercises } from '@/lib/queries/useExercises';

// Types for our workout structure
interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  timeMinutes: number;
  restSeconds: number;
  order: number;
}

interface WorkoutFormData {
  name: string;
  description: string;
  exercises: WorkoutExercise[];
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string;
  imageUrl?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkoutFormProps {
  mode: 'create' | 'edit';
  initialData?: WorkoutFormData;
  onSubmit: (data: WorkoutFormData) => Promise<void>;
  onCancel: () => void;
}

export default function WorkoutForm({ mode, initialData, onSubmit, onCancel }: WorkoutFormProps) {
  const [formData, setFormData] = useState<WorkoutFormData>(
    initialData || {
      name: '',
      description: '',
      exercises: [],
    }
  );
  
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total workout time
  const totalTime = formData.exercises.reduce((sum, ex) => sum + ex.timeMinutes, 0);

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      reps: 10,
      timeMinutes: 5,
      restSeconds: 60,
      order: formData.exercises.length,
    };

    setFormData({
      ...formData,
      exercises: [...formData.exercises, newExercise],
    });
    setShowExerciseModal(false);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = formData.exercises.filter((_, i) => i !== index);
    // Reorder remaining exercises
    const reorderedExercises = updatedExercises.map((ex, i) => ({
      ...ex,
      order: i,
    }));
    setFormData({
      ...formData,
      exercises: reorderedExercises,
    });
  };

  const handleExerciseChange = (index: number, field: keyof WorkoutExercise, value: string | number) => {
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
      order: i,
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Workout Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Workout Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Upper Body Strength"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Describe your workout..."
              />
            </div>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Exercises</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Dumbbell size={16} />
                  {formData.exercises.length} exercises
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {totalTime} minutes total
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowExerciseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add Exercise
            </button>
          </div>

          {/* Exercise List */}
          {formData.exercises.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Dumbbell size={48} className="mx-auto mb-3 text-gray-400" />
              <p>No exercises added yet</p>
              <p className="text-sm mt-1">Click "Add Exercise" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Order Controls */}
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <span className="text-sm font-medium text-gray-500 text-center">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(index, 'down')}
                        disabled={index === formData.exercises.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Exercise Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-3">{exercise.exerciseName}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Sets
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) =>
                              handleExerciseChange(index, 'sets', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Reps
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(e) =>
                              handleExerciseChange(index, 'reps', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Time (minutes)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={exercise.timeMinutes}
                            onChange={(e) =>
                              handleExerciseChange(index, 'timeMinutes', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Rest (seconds)
                          </label>
                          <input
                            type="number"
                            min="30"
                            max="300"
                            step="15"
                            value={exercise.restSeconds}
                            onChange={(e) =>
                              handleExerciseChange(index, 'restSeconds', parseInt(e.target.value) || 60)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Workout' : 'Update Workout'}
          </button>
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
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  excludedIds: string[];
}

function ExerciseSelectionModal({ onSelect, onClose, excludedIds }: ExerciseSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const { data, isLoading: loading, error } = useExercises();
  const exercises = data?.exercises || [];

  // Filter exercises
  const filteredExercises = exercises.filter((exercise) => {
    if (excludedIds.includes(exercise.id)) return false;

    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exercise.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['all', ...new Set(exercises.map((ex) => ex.category))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Exercise</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200 space-y-3">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div className="text-center py-12 text-gray-500">Loading exercises...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              {error instanceof Error ? error.message : 'Failed to load exercises'}
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No exercises found. Try adjusting your search or filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-1">{exercise.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {exercise.category}
                    </span>
                    {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {exercise.primaryMuscles[0]}
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