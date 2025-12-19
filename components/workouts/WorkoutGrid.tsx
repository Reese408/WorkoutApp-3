'use client';

import WorkoutItem from "./WorkoutItem";
import type { RoutineWithDetails } from "@/lib/types";

interface WorkoutGridProps {
  routines: RoutineWithDetails[];
}

export default function WorkoutGrid({ routines }: WorkoutGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-6">
      {routines.map((routine) => (
        <li key={routine.id}>
          <WorkoutItem routine={routine} />
        </li>
      ))}
    </ul>
  );
}
