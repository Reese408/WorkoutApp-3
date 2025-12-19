import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import WorkoutSummaryClient from './WorkoutSummaryClient';

const prisma = new PrismaClient();

export default async function WorkoutSummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ log?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/signin');
  }

  const { log: workoutLogId } = await searchParams;

  if (!workoutLogId) {
    redirect('/workouts/history');
  }

  // Fetch the completed workout log with all details
  const workoutLog = await prisma.workoutLog.findUnique({
    where: {
      id: workoutLogId,
      userId: session.user.id, // Security: ensure user owns this workout
    },
    include: {
      routine: {
        select: {
          id: true,
          name: true,
        },
      },
      setLogs: {
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
              category: true,
              muscleGroups: true,
            },
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      },
    },
  });

  if (!workoutLog) {
    notFound();
  }

  // Calculate summary stats
  const totalSets = workoutLog.setLogs.length;
  const totalReps = workoutLog.setLogs.reduce((sum, set) => sum + (set.reps || 0), 0);
  const totalVolume = workoutLog.setLogs.reduce(
    (sum, set) => sum + ((set.weight || 0) * (set.reps || 0)),
    0
  );

  // Calculate duration in minutes
  const durationMinutes = workoutLog.totalDuration || 0;

  // Group sets by exercise
  const exerciseGroups: Record<string, typeof workoutLog.setLogs> = {};
  workoutLog.setLogs.forEach((set) => {
    const exerciseName = set.exercise.name;
    if (!exerciseGroups[exerciseName]) {
      exerciseGroups[exerciseName] = [];
    }
    exerciseGroups[exerciseName].push(set);
  });

  return (
    <WorkoutSummaryClient
      workoutName={workoutLog.routine?.name || 'Quick Workout'}
      totalSets={totalSets}
      totalReps={totalReps}
      totalVolume={totalVolume}
      durationMinutes={durationMinutes}
      exerciseGroups={exerciseGroups}
      workoutLogId={workoutLog.id}
      routineId={workoutLog.routineId}
    />
  );
}
