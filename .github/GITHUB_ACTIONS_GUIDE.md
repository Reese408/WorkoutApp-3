# GitHub Actions Guide - Quick Start

## 🚀 How to Use GitHub Actions (No Manual Work!)

### The Old Way (Manual) vs The New Way (Automated)

#### ❌ Manual Workflow (What You Used To Do):
```bash
# Every time before pushing:
npm run lint          # Check for errors
npx tsc --noEmit      # Type check
npx prisma validate   # Check database schema
npm run build         # Build the app
npm audit             # Check for vulnerabilities

# Only then push if everything passes
git push
```

**Problem**: You have to remember to run all these checks every time!

#### ✅ Automated Workflow (GitHub Actions):
```bash
# Just push your code
git add .
git commit -m "your changes"
git push

# GitHub Actions automatically runs ALL checks for you!
# You get notified if anything fails
```

**Benefit**: Never forget a check, catch errors before they reach production!

---

## 📖 Step-by-Step Tutorial

### Step 1: Make Some Changes
```bash
# Edit any file
code app/dashboard/page.tsx

# Make your changes...
```

### Step 2: Commit and Push
```bash
# Stage your changes
git add .

# Commit with a message
git commit -m "feat: update dashboard styling"

# Push to GitHub
git push origin main
```

### Step 3: Watch the Magic! ✨

1. **Open your browser**
2. **Go to your GitHub repository**
   - URL: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
3. **Click the "Actions" tab**
4. **See your workflow running in real-time!**

---

## 🎯 What Happens When You Push?

```
Your Push → GitHub Detects Change → Triggers Workflow
                                          ↓
                    ┌─────────────────────┴─────────────────────┐
                    ↓                     ↓                     ↓
            ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
            │  Lint & Type  │    │    Prisma     │    │   Security    │
            │     Check     │    │    Schema     │    │     Audit     │
            └───────┬───────┘    └───────┬───────┘    └───────────────┘
                    │                    │
                    └────────┬───────────┘
                             ↓
                    ┌───────────────┐
                    │     Build     │
                    │   Next.js     │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
         ✅ All Pass              ❌ Something Failed
    (You get green checkmark)    (You get notification)
```

---

## 📊 Reading Your Workflow Results

### ✅ Success (Green Check)
```
✅ CI/CD Pipeline
   All checks passed!
   - ✅ Lint & Type Check (32s)
   - ✅ Prisma Schema Check (18s)
   - ✅ Build (1m 45s)
   - ✅ Security Audit (28s)
```

**Meaning**: Your code is good! Safe to deploy or merge.

### ❌ Failure (Red X)
```
❌ CI/CD Pipeline
   Some checks failed
   - ✅ Lint & Type Check (32s)
   - ❌ Prisma Schema Check (12s) ← Click to see details
   - ⏭️  Build (skipped)
   - ⏭️  Security Audit (skipped)
```

**Meaning**: There's an issue. Click the failed check to see what went wrong.

### Example Error Details:
```
Error: Prisma schema validation failed
  ↳ prisma/schema.prisma:15:3
    Field 'emaill' is not defined in model 'User'
    Did you mean 'email'?
```

**Fix it locally, then push again:**
```bash
# Fix the typo
code prisma/schema.prisma

# Commit and push
git add prisma/schema.prisma
git commit -m "fix: correct typo in Prisma schema"
git push

# The workflow runs again automatically!
```

---

## 🎬 Common Scenarios

### Scenario 1: You Forgot to Run Lint
```bash
# You push code without running lint
git push

# GitHub Actions catches it:
❌ ESLint found 3 errors:
   - app/dashboard/page.tsx:25 - Missing semicolon
   - app/signin/page.tsx:10 - Unused variable 'foo'
```

**What you do:**
```bash
# Fix the errors
npm run lint

# Commit and push
git add .
git commit -m "fix: resolve linting errors"
git push
```

### Scenario 2: Type Error You Missed
```bash
# You push code
git push

# GitHub Actions catches type error:
❌ TypeScript error:
   app/dashboard/page.tsx:42:15
   Property 'emaill' does not exist on type 'User'
```

**What you do:**
```bash
# Fix the typo
code app/dashboard/page.tsx

# Push again
git add .
git commit -m "fix: correct property name"
git push
```

### Scenario 3: Everything Passes! ✅
```bash
git push

# GitHub Actions:
✅ All checks passed!
   Your code is ready to deploy
```

**What you do:** Nothing! Your code is good.

---

## 🔔 Getting Notifications

### Enable Email Notifications
1. Go to GitHub → Settings → Notifications
2. Enable "Actions" notifications
3. Choose "Only failures" or "All events"

### You'll Get Emails Like:
```
Subject: ❌ CI/CD Pipeline failed for commit abc123

Your workflow run failed on commit:
"feat: update dashboard styling"

View details: [link to GitHub Actions]
```

---

## 🎯 Pull Request Workflow

### Creating a PR? Actions Run There Too!

```bash
# Create a new branch
git checkout -b feature/new-button

# Make changes
code app/dashboard/page.tsx

# Commit and push
git add .
git commit -m "feat: add new export button"
git push origin feature/new-button
```

**Then on GitHub:**
1. Click "Create Pull Request"
2. **GitHub Actions runs automatically on your PR!**
3. You (and reviewers) see if checks pass before merging

```
Pull Request #42: Add new export button

Checks:
✅ CI/CD Pipeline - All checks passed
✅ 0 security vulnerabilities found

[Merge Pull Request] ← Only appears when checks pass
```

---

## 🛠️ Troubleshooting

### "My workflow isn't running!"

**Check:**
1. Are you pushing to `main` or `develop` branch?
   ```bash
   git branch  # Shows current branch
   ```

2. Is the workflow file in the right place?
   ```bash
   ls .github/workflows/  # Should show ci.yml
   ```

3. Did you commit the workflow file?
   ```bash
   git log --oneline | grep "GitHub Actions"
   ```

### "How do I run checks locally before pushing?"

```bash
# Run what GitHub Actions will run:
npm run lint              # Linting
npx tsc --noEmit          # Type check
npx prisma validate       # Prisma check
npm run build             # Build

# If all pass, your GitHub Actions will pass too!
```

---

## 🎓 Advanced: Understanding the Workflow File

Let's break down `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline          # Name shown in GitHub UI

on:                           # When to trigger
  push:
    branches: [main, develop] # Only these branches
  pull_request:
    branches: [main, develop] # PRs to these branches

jobs:                         # What to run
  lint:                       # Job name
    runs-on: ubuntu-latest    # Run on Ubuntu server
    steps:
      - uses: actions/checkout@v4     # Get your code
      - uses: actions/setup-node@v4   # Install Node.js
      - run: npm ci                   # Install dependencies
      - run: npm run lint             # Run lint command
```

**You don't need to modify this** - it works out of the box!

---

## 🏆 Best Practices

### 1. Always Pull Before Pushing
```bash
git pull origin main  # Get latest changes
# Make your changes
git push origin main  # Push your changes
```

### 2. Check Actions Tab After Every Push
- See if checks pass
- Fix issues immediately if they fail

### 3. Use Descriptive Commit Messages
```bash
# Good ✅
git commit -m "feat: add dark mode toggle to dashboard"
git commit -m "fix: resolve email validation bug"

# Bad ❌
git commit -m "update"
git commit -m "fix stuff"
```

### 4. Don't Push Broken Code
```bash
# Quick check before pushing:
npm run lint && npm run build

# If that passes, push:
git push
```

---

## 📚 Quick Reference

| Action | Command |
|--------|---------|
| Check current branch | `git branch` |
| View workflow files | `ls .github/workflows/` |
| Run lint locally | `npm run lint` |
| Type check locally | `npx tsc --noEmit` |
| Build locally | `npm run build` |
| View Actions in browser | Go to GitHub → Actions tab |
| View failed workflow details | Click the red ❌ in Actions tab |
| Re-run failed workflow | Click "Re-run jobs" in GitHub UI |

---

## 🎉 Summary

**GitHub Actions = Automatic Testing on Every Push**

1. You push code → GitHub runs checks
2. Checks pass ✅ → You're good!
3. Checks fail ❌ → Fix and push again

**No more manual testing required!** 🚀

---

Need help? Check:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Your workflow file](.github/workflows/ci.yml)
- Or just push some code and see what happens! (It's safe - it won't break anything)
