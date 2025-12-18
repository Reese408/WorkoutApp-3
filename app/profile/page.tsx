// app/profile/page.tsx
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import LogoutButton from '@/components/LogoutButton';

export default async function ProfilePage() {
  // 🎓 Get the current session (from JWT cookie)
  const session = await getSession();
  console.log('Session:', session);

  // 🎓 If no session, redirect to login
  // (Middleware should catch this, but this is a backup)
  if (!session) {
    redirect('/login');
  }

  // 🎓 Fetch full user data from database
  const query = `
    SELECT id, username, email, created_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [session.userId]);
  const user = result.rows[0];

  // 🎓 Format the date nicely
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <LogoutButton />
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Username</label>
              <p className="text-lg text-gray-900 mt-1">{user.username}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg text-gray-900 mt-1">{user.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <p className="text-lg text-gray-900 mt-1">{joinDate}</p>
            </div>
          </div>
        </div>

        {/* Stats Section (placeholder for future) */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Workout Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600 mt-1">Total Workouts</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600 mt-1">This Week</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600 mt-1">Personal Records</p>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-6 text-sm">
            Start tracking workouts to see your stats!
          </p>
        </div>
      </div>
    </main>
  );
}