// src/app/workouts/page.tsx
// Remove 'use client' - this is a Server Component!

import { getWorkouts } from '../../../lib/workouts';
import WorkoutGrid from '../../../components/workouts/WorkoutGrid';
import Link from 'next/link';

export default async function WorkoutPage() {
  const workouts = await getWorkouts();
  
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Workout Page!</h1>
      <Link href='/routines/create'>
        <h2 className=''>Create your own workouts!</h2>
      </Link>
      <Link href='/workouts/history'>
        <h2 className="mt-4 block">View your workout history</h2>
      </Link>
      <Link href='/routines'>
        <h2 className="mt-4 block">View your personal workouts</h2>
      </Link>
      <Link href='/exercises'>
        <h2 className="mt-4 block">Browse Exercises</h2>
      </Link>
      <WorkoutGrid workout={workouts} />
    </main>
  );
}