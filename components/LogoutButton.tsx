'use client';

import { Button } from './ui/button';
import { useTransition } from 'react';
import { signOutAction } from '@/app/actions/auth';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      onClick={() => startTransition(() => signOutAction())}
      disabled={isPending}
      className="px-4 py-2 text-sm font-medium transition-colors"
    >
      {isPending ? 'Logging out...' : 'Log out'}
    </Button>
  );
}
