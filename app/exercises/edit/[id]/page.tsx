// src/app/exercises/edit/[id]/page.tsx
import ExerciseForm from "@/components/exercises/ExerciesForm";
import { getExerciseById } from "@/lib/exercises";
import { notFound } from "next/navigation";

interface EditExercisePageProps {
  params: {
    id: string;
  };
}

export default async function EditExercisePage({ params }: EditExercisePageProps) {
  // Fetch the exercise data server-side
  const exercise = await getExerciseById(params.id);
  
  // If exercise doesn't exist, show 404
  if (!exercise) {
    notFound();
  }

  return <ExerciseForm exercise={exercise} />;
}