export const routines = [
  // ======================
  // FULL BODY
  // ======================
  {
    name: "Full Body Beginner",
    description: "Balanced full body workout for beginners",
    isPublic: true,
    exercises: [
      { name: "Squat", sets: 3, reps: 8 },
      { name: "Bench Press", sets: 3, reps: 8 },
      { name: "Seated Cable Row", sets: 3, reps: 10 },
      { name: "Plank", sets: 3, duration: 45 },
    ],
  },

  {
    name: "Full Body Strength",
    description: "Heavy compound lifts for total strength",
    isPublic: true,
    exercises: [
      { name: "Deadlift", sets: 4, reps: 5 },
      { name: "Bench Press", sets: 4, reps: 6 },
      { name: "Overhead Press", sets: 3, reps: 6 },
      { name: "Pull Up", sets: 3, reps: 8 },
    ],
  },

  // ======================
  // PUSH / PULL / LEGS
  // ======================
  {
    name: "Push Day",
    description: "Chest, shoulders, and triceps",
    isPublic: true,
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
      { name: "Overhead Press", sets: 3, reps: 8 },
      { name: "Tricep Pushdown", sets: 3, reps: 12 },
      { name: "Lateral Raise", sets: 3, reps: 15 },
    ],
  },

  {
    name: "Pull Day",
    description: "Back and biceps focus",
    isPublic: true,
    exercises: [
      { name: "Deadlift", sets: 3, reps: 5 },
      { name: "Pull Up", sets: 4, reps: 8 },
      { name: "Seated Cable Row", sets: 3, reps: 10 },
      { name: "Barbell Curl", sets: 3, reps: 12 },
    ],
  },

  {
    name: "Leg Day",
    description: "Lower body strength and hypertrophy",
    isPublic: true,
    exercises: [
      { name: "Squat", sets: 4, reps: 6 },
      { name: "Leg Press", sets: 3, reps: 10 },
      { name: "Romanian Deadlift", sets: 3, reps: 8 },
      { name: "Calf Raise", sets: 4, reps: 15 },
    ],
  },

  // ======================
  // UPPER / LOWER
  // ======================
  {
    name: "Upper Body",
    description: "Chest, back, shoulders, and arms",
    isPublic: true,
    exercises: [
      { name: "Bench Press", sets: 3, reps: 8 },
      { name: "Pull Up", sets: 3, reps: 8 },
      { name: "Overhead Press", sets: 3, reps: 8 },
      { name: "Barbell Curl", sets: 3, reps: 12 },
      { name: "Tricep Pushdown", sets: 3, reps: 12 },
    ],
  },

  {
    name: "Lower Body",
    description: "Leg strength and posterior chain",
    isPublic: true,
    exercises: [
      { name: "Squat", sets: 4, reps: 6 },
      { name: "Romanian Deadlift", sets: 3, reps: 8 },
      { name: "Leg Press", sets: 3, reps: 10 },
      { name: "Calf Raise", sets: 4, reps: 15 },
    ],
  },

  // ======================
  // CONDITIONING
  // ======================
  {
    name: "Cardio & Core",
    description: "Conditioning and core endurance",
    isPublic: true,
    exercises: [
      { name: "Rowing Machine", sets: 3, duration: 300 },
      { name: "Treadmill Run", sets: 1, duration: 900 },
      { name: "Hanging Leg Raise", sets: 3, reps: 12 },
      { name: "Plank", sets: 3, duration: 60 },
    ],
  },
];
