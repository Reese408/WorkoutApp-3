// components/LogoutButton.tsx
'use client';

import { Button } from './UI/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  async function handleLogout() {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/signout', { // Fixed: was /logout, now /signout
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/login');
        router.refresh();
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? 'Logging out...' : 'Log out'}
    </Button>
  );
}