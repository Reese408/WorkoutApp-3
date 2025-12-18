'use server';

import { redirect } from 'next/navigation';
import { saveWorkout } from './workouts';
import { revalidatePath } from 'next/cache';

function isInvalidInput(text: string) {
  // Returns true for empty or whitespace-only strings.
  return !text || text.trim() === '';
}

export async function shareWorkout(prevState: any, formData: FormData) {
  const workout = {
    title: formData.get('title') as string,
    duration: formData.get('duration') as string,
    image_key: formData.get('image_key') as string,
    creator: formData.get('creator') as string,
    summary: formData.get('summary') as string,
    date: formData.get('date') as string,
  };

  if (isInvalidInput(workout.title) ||
    isInvalidInput(workout.duration) ||
    isInvalidInput(workout.image_key) ||
    isInvalidInput(workout.creator) ||
    isInvalidInput(workout.summary) ||
    !workout.image_key || workout.image_key.length === 0){
         return {
            message: 'Invalid input - please check your data.'
         }
    }

  await saveWorkout(workout);
  revalidatePath('/workouts');
  redirect('/workouts');
}
