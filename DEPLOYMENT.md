# Deployment Guide: Dairy Sustainability Reporting Hub

## 🚀 Quick Deployment Steps

### 1. GitHub Repository Setup

1. **Create a new repository on GitHub:**
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name: `dairy-sustainability-hub`
   - Description: `Dairy Sustainability Reporting Hub - A platform for Milk Unions and Producer Companies to manage sustainability reporting`
   - Make it **Public** (for free Vercel deployment)
   - Don't initialize with README (we already have one)

2. **Push your code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/dairy-sustainability-hub.git
   git branch -M main
   git push -u origin main
   ```

### 2. Vercel Deployment

1. **Connect to Vercel:**
   - Go to [Vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `dairy-sustainability-hub` repository

2. **Configure Environment Variables:**
   Add these environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your_neon_postgres_url
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your_nextauth_secret
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

3. **Deploy:**
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your app will be live at `https://your-app-name.vercel.app`

### 3. Database Setup

1. **Create Neon PostgreSQL Database:**
   - Go to [Neon.tech](https://neon.tech)
   - Create account and new project
   - Copy the connection string

2. **Set up database schema:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Create initial admin user:**
   - Use Prisma Studio: `npx prisma studio`
   - Create a user with role: `ADMIN`

### 4. Vercel Blob Storage

1. **Get Blob Token:**
   - In Vercel dashboard, go to Storage
   - Create new Blob store
   - Copy the read/write token

## 🔧 Manual Commands

If you prefer command line:

```bash
# 1. Create GitHub repo (replace YOUR_USERNAME)
gh repo create dairy-sustainability-hub --public --description "Dairy Sustainability Reporting Hub"

# 2. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/dairy-sustainability-hub.git
git branch -M main
git push -u origin main

# 3. Deploy to Vercel
npx vercel --prod
```

## 📋 Environment Variables Checklist

Make sure these are set in Vercel:

- ✅ `DATABASE_URL` - Neon PostgreSQL connection string
- ✅ `NEXTAUTH_URL` - Your Vercel app URL
- ✅ `NEXTAUTH_SECRET` - Random secret for NextAuth
- ✅ `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

## 🎯 Post-Deployment Steps

1. **Test the application:**
   - Visit your Vercel URL
   - Sign in with admin credentials
   - Test all features

2. **Set up monitoring:**
   - Enable Vercel Analytics
   - Set up error tracking

3. **Domain setup (optional):**
   - Add custom domain in Vercel
   - Update `NEXTAUTH_URL` accordingly

## 🆘 Troubleshooting

### Common Issues:

1. **Database connection errors:**
   - Check `DATABASE_URL` format
   - Ensure Neon database is active

2. **Authentication issues:**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain

3. **File upload errors:**
   - Verify `BLOB_READ_WRITE_TOKEN` is correct
   - Check Vercel Blob storage is active

### Support:
- Check Vercel deployment logs
- Review GitHub repository for issues
- Consult the main README.md for detailed setup

## 🎉 Success!

Once deployed, your Dairy Sustainability Reporting Hub will be live and ready for:
- Admin user management
- Template uploads and downloads
- User data uploads
- Draft report workflow
- Activity logging
- Historical data access
