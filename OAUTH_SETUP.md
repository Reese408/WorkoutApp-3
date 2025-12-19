# OAuth Setup Guide

This guide will help you set up Google and Apple OAuth for your application.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy the Client ID and Client Secret
8. Add to your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App" or select an existing app
3. Fill in the application details:
   - Application name: Your app name
   - Homepage URL: `http://localhost:3000` (for development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID
6. Click "Generate a new client secret" and copy the secret
7. Add to your `.env` file:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

## Testing OAuth

1. Start your development server: `npm run dev`
2. Navigate to `/signin` or `/signup`
3. Click "Continue with Google" or "Continue with GitHub"
4. Complete the OAuth flow
5. You should be redirected to `/dashboard` upon successful authentication

## Troubleshooting

### Redirect URI Mismatch
- Ensure the redirect URIs in your OAuth provider settings exactly match the callback URLs used by BetterAuth
- BetterAuth uses the pattern: `{BETTER_AUTH_URL}/api/auth/callback/{provider}`

### Invalid Credentials
- Double-check that you've copied the Client ID and Client Secret correctly
- Ensure there are no extra spaces or line breaks in your `.env` file

### Database Issues
- OAuth users need to be stored in the database
- Ensure your Prisma schema supports OAuth accounts (BetterAuth handles this automatically)
- Run `npx prisma migrate dev` if you've made schema changes

## Security Notes

- Never commit your `.env` file to version control
- Rotate your OAuth credentials regularly
- Use different credentials for development and production
- Enable additional security features like PKCE when available
