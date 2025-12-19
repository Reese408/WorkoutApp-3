'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import type { Exercise } from '@/lib/types';
import ExerciseCard from './ExerciseCard';
import ExerciseModal from './ExerciseModal';
import { useExercises } from '@/hooks/use-exercises';

interface ExerciseLibraryProps {
  initialExercises?: Exercise[];
  onSelectExercise?: (exercise: Exercise) => void;
  selectionMode?: boolean;
}

export default function ExerciseLibrary({
  initialExercises = [],
  onSelectExercise,
  selectionMode = false
}: ExerciseLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Use TanStack Query for exercises
  const { data, isLoading: loading } = useExercises({
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  const exercises = data?.data || initialExercises;

  // Filter exercises based on search (client-side for instant filtering)
  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroups?.some((mg: string) => mg.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(exercise => exercise.category === categoryFilter);
    }

    return filtered;
  }, [searchTerm, categoryFilter, exercises]);

  const categories = useMemo(() =>
    ['all', ...Array.from(new Set(exercises.map(e => e.category).filter((c): c is string => Boolean(c))))],
    [exercises]
  );

  const handleExerciseClick = (exercise: Exercise) => {
    if (selectionMode && onSelectExercise) {
      onSelectExercise(exercise);
    } else {
      setSelectedExercise(exercise);
      setShowModal(true);
    }
  };

  const handleCreateExercise = () => {
    setSelectedExercise(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedExercise(null);
    // TanStack Query will automatically refetch when cache is invalidated
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {!selectionMode && (
            <button
              onClick={handleCreateExercise}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Exercise</span>
            </button>
          )}
        </div>
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading exercises...</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No exercises found</p>
          {!selectionMode && (
            <button
              onClick={handleCreateExercise}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Create your first exercise
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => handleExerciseClick(exercise)}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      )}

      {/* Exercise Modal */}
      {showModal && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
