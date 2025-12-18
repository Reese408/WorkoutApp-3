'use client';

import Link from "next/link";
import { Workout } from "../../models/Workout";
import S3Image from "../images/S3Image";
interface WorkoutItemProps {
  workout: Workout;
}

const classes = {
  workout: "bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row mb-6",
  image: "relative w-full md:w-48 h-48 md:h-auto flex-shrink-0",
  content: "p-6 flex-1 flex flex-col justify-between",
  headerText: "text-2xl font-bold text-gray-800 mb-2",
  summary: "text-gray-600 mb-4",
  actions: "mt-auto",
};

export default function WorkoutItem({ workout }: WorkoutItemProps) {
  return (
    <article className={classes.workout}>
      <div className={classes.image}>
        <S3Image 
          s3Key={workout.image_key} 
          alt={workout.title}
          className="object-cover"
        />
      </div>
      <div className={classes.content}>
        <header>
          <h2 className={classes.headerText}>{workout.title}</h2>
          <p className="text-sm text-gray-500">By {workout.creator}</p>
        </header>
        <p className={classes.summary}>{workout.summary}</p>
        <div className={classes.actions}>
          <Link 
            href={`/workouts/${workout.slug}`} 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            View Workout
          </Link>
        </div>
      </div>
    </article>
  );
}