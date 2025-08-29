# Manual Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. **Repository Setup**
- ✅ Ensure your code is pushed to GitHub
- ✅ Make sure `vercel.json` is in the root directory
- ✅ Verify `package.json` has correct build scripts

### 2. **Environment Variables**
If your app uses environment variables, prepare these values:
```
VITE_API_URL=your-backend-url
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 🚀 Manual Deployment Steps

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click **"New Project"**

### Step 2: Import Repository
1. Select **"Import Git Repository"**
2. Choose your GitHub repository: `lp_optimization`
3. Click **"Import"**

### Step 3: Configure Project Settings
Vercel will auto-detect your settings from `vercel.json`:
- **Framework Preset**: Vite (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Add Environment Variables (if needed)
1. In the deployment configuration, expand **"Environment Variables"**
2. Add each variable with the `VITE_` prefix:
   - Key: `VITE_API_URL`
   - Value: `your-backend-url`
3. Repeat for all necessary variables

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for the build process (usually 1-3 minutes)
3. Your app will be available at: `https://your-project-name.vercel.app`

## 🔧 Project Configuration

### Current Vercel Config (`vercel.json`)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "regions": ["iad1"],
  "cleanUrls": true,
  "trailingSlash": false
}
```

### Key Features:
- ✅ **SPA Support**: Handles client-side routing
- ✅ **Asset Caching**: Optimized caching for static assets
- ✅ **Clean URLs**: Removes `.html` extensions
- ✅ **Fast Region**: Uses `iad1` (US East) for optimal performance

## 🔄 Continuous Deployment

After initial setup, Vercel will automatically:
- Deploy on every push to `main` branch
- Generate preview deployments for pull requests
- Provide deployment logs and analytics

## 🛠️ Troubleshooting

### Common Issues:
1. **Build fails**: Check build logs in Vercel dashboard
2. **Environment variables not working**: Ensure `VITE_` prefix
3. **Routing issues**: Verify SPA rewrites in `vercel.json`
4. **API calls fail**: Check CORS settings and API URLs

### Quick Fixes:
- Redeploy: Go to Deployments → Click "..." → Redeploy
- Logs: Check Functions tab for runtime logs
- Environment: Verify all variables are set correctly

## 📞 Support
If you encounter issues:
1. Check Vercel's [documentation](https://vercel.com/docs)
2. Review build logs in the dashboard
3. Verify your `vercel.json` configuration

---
**Deployment URL**: Will be assigned after deployment (e.g., `lp-optimization.vercel.app`)
