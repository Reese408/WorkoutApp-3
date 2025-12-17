"use server";

import { auth } from "@/lib/auth";
import { emailOnlySchema } from "@/lib/validations/auth";

type ActionState = {
  error?: string;
  success?: boolean;
} | null;

/**
 * ==============================================================================
 * RESEND VERIFICATION EMAIL ACTION - WITH ZOD VALIDATION
 * ==============================================================================
 *
 * SECURITY IMPROVEMENTS:
 * 1. ✅ Email validation (prevents injection attacks)
 * 2. ✅ Type safety (no unsafe "as string" casts)
 * 3. ✅ Email normalization (finds account even if caps differ)
 *
 * VULNERABILITIES FIXED:
 * ❌ BEFORE: formData.get("email") as string
 *    - Could be null → crashes
 *    - Could be malformed → database error
 *    - Could be "  TEST@EXAMPLE.COM  " → no match found
 *
 * ✅ AFTER: Email is validated, normalized, and guaranteed valid
 */
export async function resendVerificationEmail(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // STEP 1: Validate email with Zod
  const validationResult = emailOnlySchema.safeParse({
    email: formData.get("email"),
  });

  // STEP 2: Handle validation errors
  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues[0].message;
    return { error: errorMessage };
  }

  // STEP 3: Extract validated email
  const { email } = validationResult.data;

  // STEP 4: Attempt to send verification email
  try {
    await auth.api.sendVerificationEmail({
      body: {
        email, // Guaranteed valid email, lowercase, trimmed
      },
    });

    return { success: true };
  } catch (error: unknown) {
    // STEP 5: Handle errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Already verified
      if (message.includes("already verified")) {
        return { error: "This email is already verified. You can sign in." };
      }

      // Account not found
      if (message.includes("not found")) {
        return { error: "No account found with this email." };
      }

      // Generic error
      return { error: error.message };
    }
    return { error: "Failed to send verification email. Please try again." };
  }
}
