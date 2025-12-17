import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signOutAction } from "../actions/auth";
import { ModeToggle } from "@/components/toggle-theme";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
          <ModeToggle />
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">User Information</h2>
            <div className="space-y-2">
              <p className="text-sm dark:text-gray-300">
                <span className="font-medium">User ID:</span>{" "}
                <span className="font-mono text-blue-600 dark:text-blue-400">{session.user.id}</span>
              </p>
              <p className="text-sm dark:text-gray-300">
                <span className="font-medium">Email:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">{session.user.email}</span>
              </p>
              {session.user.name && (
                <p className="text-sm dark:text-gray-300">
                  <span className="font-medium">Name:</span>{" "}
                  <span className="text-gray-700 dark:text-gray-300">{session.user.name}</span>
                </p>
              )}
              <p className="text-sm dark:text-gray-300">
                <span className="font-medium">Email Verified:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">
                  {session.user.emailVerified ? "Yes" : "No"}
                </span>
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">Session Information</h2>
            <div className="space-y-2">
              <p className="text-sm dark:text-gray-300">
                <span className="font-medium">Session ID:</span>{" "}
                <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{session.session.id}</span>
              </p>
              <p className="text-sm dark:text-gray-300">
                <span className="font-medium">Expires:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(session.session.expiresAt).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>

        <form action={signOutAction} className="mt-6">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
