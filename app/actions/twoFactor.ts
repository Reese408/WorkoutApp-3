'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  generateTwoFactorSecret,
  enableTwoFactor,
  disableTwoFactor,
  verifyTwoFactorLogin,
  isTwoFactorEnabled,
  regenerateBackupCodes,
} from '@/lib/twoFactorService';

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Setup 2FA - Generate secret and QR code
 */
export async function setupTwoFactor(): Promise<
  ActionResult<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const setup = await generateTwoFactorSecret(
      session.user.id,
      session.user.email
    );

    return {
      success: true,
      data: setup,
    };
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to setup 2FA',
    };
  }
}

/**
 * Enable 2FA - Verify token and activate 2FA
 */
export async function enableTwoFactorAction(
  verificationToken: string
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const result = await enableTwoFactor(session.user.id, verificationToken);

    return result;
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enable 2FA',
    };
  }
}

/**
 * Disable 2FA
 */
export async function disableTwoFactorAction(): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    await disableTwoFactor(session.user.id);

    return { success: true };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disable 2FA',
    };
  }
}

/**
 * Verify 2FA code during login
 */
export async function verifyTwoFactorCode(
  userId: string,
  code: string
): Promise<ActionResult> {
  try {
    const result = await verifyTwoFactorLogin(userId, code);
    return result;
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to verify 2FA code',
    };
  }
}

/**
 * Check if user has 2FA enabled
 */
export async function checkTwoFactorStatus(): Promise<
  ActionResult<{ enabled: boolean }>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const enabled = await isTwoFactorEnabled(session.user.id);

    return {
      success: true,
      data: { enabled },
    };
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to check 2FA status',
    };
  }
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodesAction(): Promise<
  ActionResult<{ backupCodes: string[] }>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const backupCodes = await regenerateBackupCodes(session.user.id);

    return {
      success: true,
      data: { backupCodes },
    };
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to regenerate backup codes',
    };
  }
}
