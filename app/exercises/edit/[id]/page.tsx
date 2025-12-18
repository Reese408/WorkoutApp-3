import ExerciseForm from "@/components/exercises/ExerciesForm";
import { getExercise } from "@/app/actions/exercises";
import { notFound } from "next/navigation";

interface EditExercisePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditExercisePage({ params }: EditExercisePageProps) {
  const { id } = await params;
  const result = await getExercise(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ExerciseForm exercise={result.data} />;
}