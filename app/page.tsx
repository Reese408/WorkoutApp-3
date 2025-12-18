import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ModeToggle } from "@/components/toggle-theme";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center gap-8 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full relative">
        {/* Theme toggle in top right */}
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>

        <div className="text-center mt-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Workout Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your fitness journey with precision
          </p>
        </div>

        {session ? (
          <div className="w-full space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200 text-center">
                Signed in as <span className="font-semibold">{session.user.email}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard"
                className="block px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white text-center rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/routines"
                className="block px-6 py-3 bg-purple-600 dark:bg-purple-700 text-white text-center rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-medium"
              >
                Routines
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/exercises"
                className="block px-6 py-3 bg-emerald-600 dark:bg-emerald-700 text-white text-center rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors font-medium"
              >
                Exercises
              </Link>
              <Link
                href="/workouts/history"
                className="block px-6 py-3 bg-orange-600 dark:bg-orange-700 text-white text-center rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors font-medium"
              >
                History
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3">
            <Link
              href="/signin"
              className="block w-full px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white text-center rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="block w-full px-6 py-3 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 text-center rounded-lg border-2 border-blue-600 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Create Account
            </Link>
          </div>
        )}

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with Next.js 16 + Better Auth + Prisma</p>
        </div>
      </main>
    </div>
  );
}