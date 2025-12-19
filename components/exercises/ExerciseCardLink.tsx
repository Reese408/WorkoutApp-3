'use client';

import { useRouter } from 'next/navigation';
import ExerciseCard from './ExerciseCard';
import type { Exercise } from '@/lib/types';

interface ExerciseCardLinkProps {
  exercise: Exercise;
  href: string;
}

export default function ExerciseCardLink({ exercise, href }: ExerciseCardLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return <ExerciseCard exercise={exercise} onClick={handleClick} />;
}