'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, X, Copy, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  setupTwoFactor,
  enableTwoFactorAction,
  disableTwoFactorAction,
  checkTwoFactorStatus,
  regenerateBackupCodesAction,
} from '@/app/actions/twoFactor';

interface TwoFactorSettingsProps {
  initialEnabled?: boolean;
}

export default function TwoFactorSettings({
  initialEnabled = false,
}: TwoFactorSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const result = await checkTwoFactorStatus();
    if (result.success && result.data) {
      setIsEnabled(result.data.enabled);
    }
  };

  const handleSetup = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await setupTwoFactor();

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to setup 2FA');
        return;
      }

      setQrCodeUrl(result.data.qrCodeUrl);
      setSecret(result.data.secret);
      setBackupCodes(result.data.backupCodes);
      setShowSetup(true);
    } catch (err) {
      setError('Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!verificationCode) {
      setError('Please enter a verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await enableTwoFactorAction(verificationCode);

      if (!result.success) {
        setError(result.error || 'Failed to enable 2FA');
        return;
      }

      setSuccess('Two-factor authentication enabled successfully!');
      setIsEnabled(true);
      setShowSetup(false);
      setVerificationCode('');
    } catch (err) {
      setError('Failed to enable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await disableTwoFactorAction();

      if (!result.success) {
        setError(result.error || 'Failed to disable 2FA');
        return;
      }

      setSuccess('Two-factor authentication disabled');
      setIsEnabled(false);
      setShowDisableDialog(false);
    } catch (err) {
      setError('Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await regenerateBackupCodesAction();

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to regenerate backup codes');
        return;
      }

      setBackupCodes(result.data.backupCodes);
      setSuccess('Backup codes regenerated successfully');
    } catch (err) {
      setError('Failed to regenerate backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            {success}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Status:{' '}
              {isEnabled ? (
                <span className="text-green-600 dark:text-green-400">
                  Enabled
                </span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">
                  Disabled
                </span>
              )}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isEnabled
                ? 'Your account is protected with 2FA'
                : 'Enable 2FA to secure your account'}
            </p>
          </div>

          {!isEnabled ? (
            <Button
              onClick={handleSetup}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Setting up...' : 'Enable 2FA'}
            </Button>
          ) : (
            <Button
              onClick={() => setShowDisableDialog(true)}
              variant="destructive"
              disabled={isLoading}
            >
              Disable 2FA
            </Button>
          )}
        </div>

        {/* Setup Dialog */}
        {showSetup && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Step 1: Scan QR Code
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
              {qrCodeUrl && (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={qrCodeUrl}
                    alt="2FA QR Code"
                    className="border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Or enter this code manually:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono">
                        {secret}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(secret)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Step 2: Save Backup Codes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Save these backup codes in a safe place. You can use them to
                access your account if you lose your device.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="bg-white dark:bg-gray-900 px-3 py-2 rounded text-sm font-mono text-center border border-gray-200 dark:border-gray-700"
                    >
                      {code}
                    </code>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadBackupCodes}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Backup Codes
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Step 3: Verify Setup
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter the 6-digit code from your authenticator app to complete
                setup
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleEnable}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSetup(false);
                      setVerificationCode('');
                      setError('');
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backup Codes Management (only shown when 2FA is enabled) */}
        {isEnabled && !showSetup && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Backup Codes
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Regenerate backup codes if you've lost them
                </p>
              </div>
              <Button
                onClick={handleRegenerateBackupCodes}
                variant="outline"
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {/* Disable 2FA Dialog */}
        <AlertDialog
          open={showDisableDialog}
          onOpenChange={setShowDisableDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
              <AlertDialogDescription>
                This will make your account less secure. You'll only need your
                password to sign in.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDisable}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'Disabling...' : 'Disable 2FA'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
