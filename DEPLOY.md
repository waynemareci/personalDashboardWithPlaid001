# Deployment Instructions

## Push to GitHub

Run these commands from your project directory:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Personal Dashboard with Plaid integration"

# Add remote repository
git remote add origin https://github.com/waynemareci/personalDashboardWithPlaid001.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Verify Before Pushing

Make sure `.env.local` is NOT included:
```bash
git status
```

You should NOT see `.env.local` in the list. If you do:
```bash
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"
```

## Deploy to Vercel

After pushing to GitHub:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and link to your GitHub repo
```

## Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable from your `.env.local`:
   - MONGODB_URI
   - MONGODB_DB
   - PLAID_CLIENT_ID
   - PLAID_SECRET
   - PLAID_ENV
   - NEXT_PUBLIC_PLAID_ENV

5. Redeploy if needed

## Update Plaid Dashboard

Once deployed to Vercel (e.g., `https://your-app.vercel.app`):

1. Go to https://dashboard.plaid.com
2. Navigate to Team Settings → API
3. Add redirect URI: `https://your-app.vercel.app`
4. Save changes

## Switch to Production

When ready for production:

1. Update environment variables in Vercel:
   - Change `PLAID_SECRET` to production secret
   - Change `PLAID_ENV` to `production`
   - Change `NEXT_PUBLIC_PLAID_ENV` to `production`

2. Request institution access from Plaid support

3. Test with real bank accounts
