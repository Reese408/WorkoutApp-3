import Link from "next/link";
import { AuthForm } from "@/components/ui/auth-form";
import { signInAction } from "../actions/auth";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        <AuthForm action={signInAction} type="signin" />

        <div className="mt-4 space-y-2 text-center text-sm text-gray-600">
          <p>
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </p>
          <p>
            Need to verify your email?{" "}
            <Link href="/resend-verification" className="text-blue-600 hover:underline">
              Resend verification email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
