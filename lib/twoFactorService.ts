import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Use singleton pattern for Prisma client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

/**
 * Generate a new TOTP secret and QR code for 2FA setup
 */
export async function generateTwoFactorSecret(
  userId: string,
  userEmail: string
): Promise<TwoFactorSetup> {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `Workout App (${userEmail})`,
    issuer: 'Workout App',
  });

  if (!secret.otpauth_url) {
    throw new Error('Failed to generate OTP auth URL');
  }

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  // Generate backup codes
  const backupCodes = generateBackupCodes();

  // Store in database (but not enabled yet)
  await prisma.twoFactor.upsert({
    where: { userId },
    update: {
      secret: secret.base32,
      backupCodes,
      enabled: false,
    },
    create: {
      userId,
      secret: secret.base32,
      backupCodes,
      enabled: false,
    },
  });

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
  };
}

/**
 * Verify a TOTP token
 */
export function verifyTOTPToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps before/after for clock drift
  });
}

/**
 * Enable 2FA for a user after verifying their token
 */
export async function enableTwoFactor(
  userId: string,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  // Get the user's 2FA record
  const twoFactor = await prisma.twoFactor.findUnique({
    where: { userId },
  });

  if (!twoFactor) {
    return { success: false, error: '2FA not set up for this user' };
  }

  // Verify the token
  const isValid = verifyTOTPToken(twoFactor.secret, verificationToken);

  if (!isValid) {
    return { success: false, error: 'Invalid verification code' };
  }

  // Enable 2FA
  await prisma.twoFactor.update({
    where: { userId },
    data: { enabled: true },
  });

  // Update user's 2FA status
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true },
  });

  return { success: true };
}

/**
 * Disable 2FA for a user
 */
export async function disableTwoFactor(userId: string): Promise<void> {
  await prisma.twoFactor.update({
    where: { userId },
    data: { enabled: false },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false },
  });
}

/**
 * Verify 2FA code during login
 */
export async function verifyTwoFactorLogin(
  userId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const twoFactor = await prisma.twoFactor.findUnique({
    where: { userId },
  });

  if (!twoFactor || !twoFactor.enabled) {
    return { success: false, error: '2FA not enabled for this user' };
  }

  // Check if it's a TOTP token
  const isValidToken = verifyTOTPToken(twoFactor.secret, code);
  if (isValidToken) {
    return { success: true };
  }

  // Check if it's a backup code
  const backupCodeIndex = twoFactor.backupCodes.indexOf(code);
  if (backupCodeIndex !== -1) {
    // Remove used backup code
    const updatedBackupCodes = [...twoFactor.backupCodes];
    updatedBackupCodes.splice(backupCodeIndex, 1);

    await prisma.twoFactor.update({
      where: { userId },
      data: { backupCodes: updatedBackupCodes },
    });

    return { success: true };
  }

  return { success: false, error: 'Invalid verification code' };
}

/**
 * Check if user has 2FA enabled
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  });

  return user?.twoFactorEnabled || false;
}

/**
 * Generate backup codes
 */
function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Regenerate backup codes for a user
 */
export async function regenerateBackupCodes(
  userId: string
): Promise<string[]> {
  const twoFactor = await prisma.twoFactor.findUnique({
    where: { userId },
  });

  if (!twoFactor) {
    throw new Error('2FA not set up for this user');
  }

  const newBackupCodes = generateBackupCodes();

  await prisma.twoFactor.update({
    where: { userId },
    data: { backupCodes: newBackupCodes },
  });

  return newBackupCodes;
}
