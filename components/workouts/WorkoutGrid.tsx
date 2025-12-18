import WorkoutItem from "./WorkoutItem";
import { Workout } from "../../models/Workout";

interface WorkoutGridProps {
  workout: Workout[];
}

export default function WorkoutGrid({ workout }: WorkoutGridProps) {
    return(
      <ul className="">
        {workout.map((workout: Workout) => (
          <li key={workout.id}>
            <WorkoutItem workout={workout} />
          </li>
        ))}
      </ul>
    );
}