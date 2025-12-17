import { z } from "zod";

/**
 * ==============================================================================
 * AUTHENTICATION VALIDATION SCHEMAS
 * ==============================================================================
 *
 * This file contains Zod schemas for validating authentication-related inputs.
 * Zod provides:
 * 1. Runtime validation (catches bad data before it reaches your database)
 * 2. Type safety (TypeScript knows exactly what type your data is)
 * 3. Clear error messages (users get helpful feedback)
 * 4. Input sanitization (removes dangerous characters, trims whitespace)
 */

/**
 * ------------------------------------------------------------------------------
 * EMAIL VALIDATION
 * ------------------------------------------------------------------------------
 *
 * WHY NEEDED:
 * - Prevents invalid emails from being stored (e.g., "not-an-email")
 * - Protects against email injection attacks
 * - Normalizes emails (lowercase, trimmed) for consistency
 *
 * VULNERABILITIES IT FIXES:
 * ❌ Before: formData.get("email") as string
 *    - Could be null/undefined → crashes your app
 *    - Could be "  MyEmail@EXAMPLE.COM  " → duplicate accounts
 *    - Could be 10MB of text → DoS attack
 *
 * ✅ After: Guarantees valid, normalized email or rejects request
 */
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .min(5, "Email must be at least 5 characters") // Shortest valid: a@b.c
  .max(255, "Email must not exceed 255 characters") // Prevent DoS
  .email("Please enter a valid email address")
  .trim() // Remove leading/trailing whitespace
  .toLowerCase(); // Convert to lowercase for consistency

/**
 * ------------------------------------------------------------------------------
 * PASSWORD VALIDATION
 * ------------------------------------------------------------------------------
 *
 * WHY NEEDED:
 * - Enforces strong passwords (prevents "password123")
 * - Reduces risk of brute force attacks
 * - Protects users from common password mistakes
 *
 * VULNERABILITIES IT FIXES:
 * ❌ Before: No validation → password "a" would be accepted
 * ✅ After: Requires 8+ chars, uppercase, lowercase, number, special char
 *
 * SECURITY BEST PRACTICES:
 * - Min 8 characters (industry standard)
 * - Mix of character types (harder to crack)
 * - Max 100 characters (prevents DoS via huge passwords)
 */
const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character (!@#$%^&* etc.)"
  );

/**
 * ------------------------------------------------------------------------------
 * NAME VALIDATION
 * ------------------------------------------------------------------------------
 *
 * WHY NEEDED:
 * - Prevents XSS attacks via name field
 * - Ensures names are reasonable length
 * - Removes dangerous characters
 *
 * VULNERABILITIES IT FIXES:
 * ❌ Before: User could input: <script>alert('XSS')</script>
 *    - Gets stored in database
 *    - Renders on dashboard → executes malicious code!
 *
 * ✅ After: Only allows letters, spaces, hyphens, apostrophes
 *    - Blocks <script> tags
 *    - Blocks SQL injection attempts
 *    - Trims whitespace
 */
const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters")
  .trim()
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  );

/**
 * ------------------------------------------------------------------------------
 * SIGN UP SCHEMA
 * ------------------------------------------------------------------------------
 *
 * Validates all fields required for user registration.
 *
 * TYPE SAFETY BENEFIT:
 * After validation, TypeScript KNOWS these values are:
 * - email: string (valid email, lowercase, 5-255 chars)
 * - password: string (strong password, 8-100 chars)
 * - name: string (safe name, 2-100 chars, no XSS)
 *
 * No more "as string" casts needed!
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

/**
 * ------------------------------------------------------------------------------
 * SIGN IN SCHEMA
 * ------------------------------------------------------------------------------
 *
 * Validates sign in credentials.
 *
 * NOTE: We use relaxed password validation here (just min 1 char) because:
 * 1. User may have old password that doesn't meet new requirements
 * 2. We'll check against hashed password anyway
 * 3. Better Auth will reject if wrong
 *
 * We still validate email to prevent injection attacks.
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required"),
});

/**
 * ------------------------------------------------------------------------------
 * EMAIL ONLY SCHEMA (for resend verification)
 * ------------------------------------------------------------------------------
 *
 * Used when we only need to validate an email address.
 */
export const emailOnlySchema = z.object({
  email: emailSchema,
});

/**
 * ------------------------------------------------------------------------------
 * VERIFICATION TOKEN SCHEMA
 * ------------------------------------------------------------------------------
 *
 * Validates the email verification token.
 *
 * WHY NEEDED:
 * - Prevents passing empty/null tokens to verification API
 * - Ensures token exists before making database query
 */
export const verificationTokenSchema = z.object({
  token: z
    .string()
    .min(1, "Verification token is required"),
});

/**
 * ==============================================================================
 * TYPE EXPORTS
 * ==============================================================================
 *
 * These types are automatically inferred from the schemas.
 * Use them in your code for type safety!
 *
 * Example:
 * ```typescript
 * function handleSignUp(data: SignUpInput) {
 *   // TypeScript knows data.email is a valid email string
 *   // TypeScript knows data.password is a strong password string
 *   // No runtime errors from null/undefined!
 * }
 * ```
 */
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>;
export type VerificationTokenInput = z.infer<typeof verificationTokenSchema>;

/**
 * ==============================================================================
 * USAGE EXAMPLES
 * ==============================================================================
 *
 * // ❌ UNSAFE (Old Way)
 * const email = formData.get("email") as string;  // Could be null!
 *
 * // ✅ SAFE (New Way with Zod)
 * const result = signUpSchema.safeParse({
 *   email: formData.get("email"),
 *   password: formData.get("password"),
 *   name: formData.get("name"),
 * });
 *
 * if (!result.success) {
 *   return { error: result.error.errors[0].message };
 * }
 *
 * // Now result.data is 100% validated and type-safe!
 * const { email, password, name } = result.data;
 */
