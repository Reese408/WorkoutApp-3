import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: false,
      sendVerificationEmail: async ({ user, token }: { user: { email: string; name: string }; url: string; token: string }) => {
        // Create a custom verification URL that points to our Next.js page
        const verificationUrl = `${process.env.BETTER_AUTH_URL}/verify-email?token=${token}`;

        try {
          await resend.emails.send({
            from: "onboarding@resend.dev", // Replace with your verified domain
            to: user.email,
            subject: "Verify your email address",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Verify Your Email</h1>
                <p style="color: #666; font-size: 16px;">
                  Thanks for signing up! Please verify your email address by clicking the button below:
                </p>
                <a
                  href="${verificationUrl}"
                  style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;"
                >
                  Verify Email
                </a>
                <p style="color: #999; font-size: 14px;">
                  If you didn't create an account, you can safely ignore this email.
                </p>
                <p style="color: #999; font-size: 14px;">
                  Or copy and paste this link: ${verificationUrl}
                </p>
              </div>
            `,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw error;
        }
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    plugins: [nextCookies()],
});