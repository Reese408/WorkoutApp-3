// src/app/routines/[id]/execute/page.tsx
import WorkoutExecutionClient from './WorkoutExecutionClient';
import { notFound } from 'next/navigation';
import pool from '@/lib/db';

interface PageProps {
  params: Promise<{ id: string }>;  // ← Promise in Next.js 15
}

// Server Component - fetches workout data
export default async function WorkoutExecutePage({ params }: PageProps) {
  const { id } = await params;  // ← AWAIT params

  // Fetch workout routine details
  try {
    const result = await pool.query(
      'SELECT id, name as title FROM workout_routines WHERE id = $1',  // ← Correct table
      [id]
    );

    if (result.rows.length === 0) {
      notFound();
    }

    const routine = result.rows[0];

    return (
      <WorkoutExecutionClient 
        workoutId={routine.id} 
        workoutTitle={routine.title} 
      />
    );

  } catch (error) {
    console.error('Error loading workout:', error);
    notFound();
  }
}