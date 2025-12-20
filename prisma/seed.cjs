const { PrismaClient } = require("@prisma/client");
const { exercises } = require("./seed-data/exercise");
const { routines } = require("./seed-data/routine");


const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ---------------------------------------------------------------------------
  // 1. SYSTEM USER
  // ---------------------------------------------------------------------------
  const systemUser = await prisma.user.upsert({
    where: { email: "system@workout.app" },
    update: {},
    create: {
      email: "system@workout.app",
      name: "System",
      username: "system",
      emailVerified: true,
    },
  });

  console.log("✅ System user ready:", systemUser.id);

  // ---------------------------------------------------------------------------
  // 2. GLOBAL EXERCISES
  // ---------------------------------------------------------------------------
  console.log("📦 Seeding exercises...");

  const exerciseMap = new Map();

  for (const exercise of exercises) {
    const created = await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: {
        name: exercise.name,
        category: exercise.category,
        muscleGroups: exercise.muscleGroups,
        equipmentNeeded: exercise.equipmentNeeded ?? null,
        instructions: exercise.instructions ?? null,
        videoUrl: null,
        demoGifUrl: null,
        isPublic: true,
        createdBy: null, // GLOBAL
      },
    });

    exerciseMap.set(created.name, created.id);
    console.log(`  ➕ ${created.name}`);
  }

  console.log(`✅ ${exerciseMap.size} exercises seeded`);

  // ---------------------------------------------------------------------------
  // 3. GLOBAL ROUTINES
  // ---------------------------------------------------------------------------
  console.log("📦 Seeding routines...");

  for (const routine of routines) {
    console.log(`  ➕ ${routine.name}`);

    const createdRoutine = await prisma.workoutRoutine.upsert({
      where: {
        name_createdBy: {
          name: routine.name,
          createdBy: systemUser.id,
        },
      },
      update: {},
      create: {
        name: routine.name,
        description: routine.description ?? null,
        isPublic: true,
        createdBy: systemUser.id,
      },
    });

    // Safe re-seed
    await prisma.workoutExercise.deleteMany({
      where: { routineId: createdRoutine.id },
    });

    let orderIndex = 0;

    for (const ex of routine.exercises) {
      const exerciseId = exerciseMap.get(ex.name);

      if (!exerciseId) {
        throw new Error(`❌ Exercise not found: ${ex.name}`);
      }

      await prisma.workoutExercise.create({
        data: {
          routineId: createdRoutine.id,
          exerciseId,
          orderIndex,
          targetSets: ex.sets,
          targetReps: ex.reps ?? null,
          targetDuration: ex.duration ?? null,
        },
      });

      orderIndex++;
    }
  }

  console.log("🎉 Database seed complete");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
