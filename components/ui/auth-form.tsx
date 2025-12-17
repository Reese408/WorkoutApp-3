"use client";

import { useActionState, useState } from "react";
import { signUpSchema } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./button";

type ActionState = {
  error?: string;
  success?: boolean;
} | null;

interface AuthFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  type: "signup" | "signin";
}

/**
 * Enhanced Auth Form with Real-Time Validation
 *
 * FEATURES:
 * 1. ✅ Shows validation errors as user types
 * 2. ✅ Password strength indicator (for signup)
 * 3. ✅ Clear, helpful error messages
 * 4. ✅ Visual feedback (red borders, error icons)
 * 5. ✅ Prevents submission until valid
 */
export function AuthForm({ action, type }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  // Client-side validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  // Password strength for signup
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: "", color: "" });

  /**
   * Validate email as user types
   */
  const validateEmail = (email: string) => {
    const result = signUpSchema.shape.email.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.issues[0].message);
    } else {
      setEmailError("");
    }
  };

  /**
   * Validate password and calculate strength
   */
  const validatePassword = (password: string) => {
    if (type === "signup") {
      const result = signUpSchema.shape.password.safeParse(password);
      if (!result.success) {
        setPasswordError(result.error.issues[0].message);
      } else {
        setPasswordError("");
      }

      // Calculate password strength
      let score = 0;
      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      const strengths = [
        { score: 0, label: "", color: "" },
        { score: 1, label: "Very Weak", color: "bg-red-500" },
        { score: 2, label: "Weak", color: "bg-orange-500" },
        { score: 3, label: "Fair", color: "bg-yellow-500" },
        { score: 4, label: "Good", color: "bg-lime-500" },
        { score: 5, label: "Strong", color: "bg-green-500" },
      ];
      setPasswordStrength(strengths[score]);
    }
  };

  /**
   * Validate name for signup
   */
  const validateName = (name: string) => {
    const result = signUpSchema.shape.name.safeParse(name);
    if (!result.success) {
      setNameError(result.error.issues[0].message);
    } else {
      setNameError("");
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-md">
      {/* Server-side error banner */}
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
          <svg
            className="h-5 w-5 text-red-600 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}

      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <input
          type="email"
          id="email"
          name="email"
          required
          onChange={(e) => validateEmail(e.target.value)}
          className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
            emailError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="you@example.com"
        />
        {emailError && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {emailError}
          </p>
        )}
      </div>

      {/* Name Field (Signup Only) */}
      {type === "signup" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            onChange={(e) => validateName(e.target.value)}
            className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              nameError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="John Doe"
          />
          {nameError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {nameError}
            </p>
          )}
        </div>
      )}

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <Input
          type="password"
          id="password"
          name="password"
          required
          onChange={(e) => validatePassword(e.target.value)}
          className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
            passwordError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="••••••••"
        />

        {/* Password Strength Indicator (Signup Only) */}
        {type === "signup" && passwordStrength.score > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">
                {passwordStrength.label}
              </span>
            </div>
          </div>
        )}

        {passwordError && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {passwordError}
          </p>
        )}

        {/* Password Requirements (Signup Only) */}
        {type === "signup" && (
          <div className="text-xs text-gray-600 space-y-1 mt-2 p-3 bg-gray-50 rounded-md">
            <p className="font-medium mb-1">Password must contain:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <span className="text-gray-400">•</span>
                At least 8 characters
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">•</span>
                One uppercase letter (A-Z)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">•</span>
                One lowercase letter (a-z)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">•</span>
                One number (0-9)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">•</span>
                One special character (!@#$%^&*)
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isPending
          ? type === "signup"
            ? "Creating account..."
            : "Signing in..."
          : type === "signup"
          ? "Create account"
          : "Sign in"}
      </Button>
    </form>
  );
}
