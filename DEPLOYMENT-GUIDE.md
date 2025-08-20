# Pet Owner System - Vercel & Supabase Deployment Guide

This guide will walk you through deploying your Pet Owner System to Vercel with Supabase as the database backend.

## 🎯 Overview

Your project is already configured with:
- ✅ React frontend (Vite)
- ✅ Express.js API backend
- ✅ Supabase PostgreSQL database
- ✅ Drizzle ORM for database management
- ✅ Vercel deployment configuration

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **GitHub Repository**: Your code should be in a GitHub repository

## 🗄️ Step 1: Supabase Setup (Already Done!)

Your Supabase project is already configured with:
- Project URL: `https://fdvzywecvhcpvuplzndm.supabase.co`
- Database tables created and migrated
- Connection strings configured

**Note**: Your current Supabase credentials are already in your `.env` file.

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**:
   Click "Environment Variables" and add these:

   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://fdvzywecvhcpvuplzndm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdnp5d2VjdmhjcHZ1cGx6bmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODc3NzcsImV4cCI6MjA3MDY2Mzc3N30.Voyic9j6Ffmd-81W_83pKzlUwJMOZ6MjJhh25wfDNCQ
   
   # Vite Environment Variables
   VITE_SUPABASE_URL=https://fdvzywecvhcpvuplzndm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdnp5d2VjdmhjcHZ1cGx6bmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODc3NzcsImV4cCI6MjA3MDY2Mzc3N30.Voyic9j6Ffmd-81W_83pKzlUwJMOZ6MjJhh25wfDNCQ
   
   # Database Configuration
   DATABASE_URL=postgres://postgres.fdvzywecvhcpvuplzndm:Ud4LmEOrDm6TCZqq@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   POSTGRES_URL=postgres://postgres.fdvzywecvhcpvuplzndm:Ud4LmEOrDm6TCZqq@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   
   # Session Configuration
   SESSION_SECRET=gloss-pet-secret-key-2025-production
   
   # Environment
   NODE_ENV=production
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add DATABASE_URL
   # ... add all other environment variables
   ```

## 🔧 Step 3: Verify Deployment

1. **Check Frontend**: Visit your Vercel URL to ensure the React app loads
2. **Test API**: Check `https://your-app.vercel.app/api/health` (if you have a health endpoint)
3. **Database Connection**: Verify that data loads correctly from Supabase

## 🛠️ Step 4: Post-Deployment Configuration

### Update CORS Settings (if needed)
If you encounter CORS issues, update your Express app configuration:

```typescript
// In server/app.ts
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Monitor Performance
- Check Vercel Analytics
- Monitor Supabase usage in the dashboard
- Set up error tracking (optional)

## 🔍 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation
   - Check build logs in Vercel dashboard

2. **Database Connection Issues**:
   - Verify environment variables are set correctly
   - Check Supabase project status
   - Ensure SSL is enabled in connection string

3. **API Routes Not Working**:
   - Verify `vercel.json` configuration
   - Check function logs in Vercel dashboard
   - Ensure API routes are properly exported

### Debug Commands:

```bash
# Test local build
npm run build

# Test database connection
npm run test:connection

# Check TypeScript compilation
npm run check
```

## 📊 Monitoring & Maintenance

1. **Supabase Dashboard**: Monitor database usage and performance
2. **Vercel Analytics**: Track application performance and usage
3. **Error Logging**: Set up error tracking for production issues

## 🎉 Success!

Your Pet Owner System should now be live on Vercel with Supabase as the database backend!

**Next Steps**:
- Set up custom domain (optional)
- Configure monitoring and alerts
- Set up automated backups
- Implement CI/CD pipeline for future updates
