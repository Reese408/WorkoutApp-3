import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWorkoutStats, getPersonalRecords } from "@/app/actions/workouts";
import LogoutButton from "@/components/LogoutButton";
import { ModeToggle } from "@/components/toggle-theme";
import TwoFactorSettings from "@/components/security/TwoFactorSettings";
import {
  User,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  Dumbbell,
  Target,
  Clock,
  BarChart3,
  Trophy,
  Flame
} from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/signin');
  }

  // Fetch user stats
  const statsResult = await getWorkoutStats();
  const stats = statsResult.success ? statsResult.data : null;

  const recordsResult = await getPersonalRecords();
  const records = recordsResult.success && recordsResult.data ? recordsResult.data : [];

  const joinDate = new Date(session.user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate estimated 1RM for each record using Epley formula
  const recordsWithEstimated1RM = records.map(record => ({
    ...record,
    estimated1RM: Math.round(record.weight * (1 + record.reps / 30))
  }));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {session.user.name || 'Your Profile'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and manage your fitness journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <LogoutButton />
          </div>
        </div>

        {/* Stats Overview Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Dumbbell className="w-8 h-8 opacity-80" />
                <BarChart3 className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-3xl font-bold">{stats.totalWorkouts}</p>
              <p className="text-sm opacity-90 mt-1">Total Workouts</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-3xl font-bold">{stats.workoutsThisWeek}</p>
              <p className="text-sm opacity-90 mt-1">This Week</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-3xl font-bold">{stats.totalSets.toLocaleString()}</p>
              <p className="text-sm opacity-90 mt-1">Total Sets</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 opacity-80" />
                <BarChart3 className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-3xl font-bold">{stats.totalVolume.toLocaleString()}</p>
              <p className="text-sm opacity-90 mt-1">Volume (lbs)</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 opacity-80" />
                <Calendar className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-3xl font-bold">{stats.totalMinutesThisWeek}</p>
              <p className="text-sm opacity-90 mt-1">Mins This Week</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Info</h2>
                <Link
                  href="/profile/edit"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </Link>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1" />
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</label>
                    <p className="text-base text-gray-900 dark:text-white mt-1">
                      {session.user.name || 'Not set'}
                    </p>
                  </div>
                </div>

                {(session.user as any).username && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1" />
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Username</label>
                      <p className="text-base text-gray-900 dark:text-white mt-1">
                        @{(session.user as any).username}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1" />
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</label>
                    <p className="text-base text-gray-900 dark:text-white mt-1 break-all">{session.user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1" />
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Member Since</label>
                    <p className="text-base text-gray-900 dark:text-white mt-1">{joinDate}</p>
                  </div>
                </div>

                {session.user.emailVerified && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Email Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Two-Factor Authentication Settings */}
            <TwoFactorSettings initialEnabled={(session.user as any).twoFactorEnabled || false} />

            {/* Empty State for Stats */}
            {!stats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Start Your Journey
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Complete your first workout to see your stats!
                  </p>
                  <Link
                    href="/routines"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Dumbbell className="w-4 h-4" />
                    Browse Routines
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Personal Records */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Records</h2>
                </div>
                {records.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {records.length} record{records.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {records.length > 0 ? (
                <div className="space-y-3">
                  {recordsWithEstimated1RM.map((record, index) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-lg">
                            {record.exercise.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              {record.exercise.category}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {record.weight} <span className="text-sm font-normal">lbs</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {record.reps} reps
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Est. 1RM: {record.estimated1RM} lbs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Personal Records Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Start logging workouts to track your personal bests!
                  </p>
                  <Link
                    href="/routines"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Dumbbell className="w-4 h-4" />
                    Start Working Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
