import WorkoutExecutionClient from './WorkoutExecutionClient';
import { notFound } from 'next/navigation';
import { getRoutine } from "@/app/actions/routines";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkoutExecutePage({ params }: PageProps) {
  const { id } = await params;

  const result = await getRoutine(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const routine = result.data;

  return (
    <WorkoutExecutionClient
      workoutId={routine.id}
      workoutTitle={routine.name}
    />
  );
}