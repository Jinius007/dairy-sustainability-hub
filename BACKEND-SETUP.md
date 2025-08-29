# Backend Setup Guide - Vercel Blob + Neon PostgreSQL

This guide explains how to set up the backend storage for your Dairy Sustainability Hub using Vercel Blob Storage and Neon PostgreSQL.

## 🗄️ Database Setup (Neon PostgreSQL)

### 1. Create Neon Database
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host/database`)

### 2. Set Environment Variables
Create a `.env.local` file in your project root:

```env
# Database Configuration
POSTGRES_URL="your-neon-connection-string-here"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database
Run these commands to set up your database:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

## 📁 File Storage Setup (Vercel Blob)

### 1. Create Vercel Blob Store
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Storage" tab
4. Create a new Blob store
5. Copy the `BLOB_READ_WRITE_TOKEN`

### 2. Update Environment Variables
Add the blob token to your `.env.local`:

```env
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token-here"
```

## 🔧 API Endpoints

Your backend includes these API routes:

### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Upload new template (Admin only)
- `GET /api/templates/[id]` - Get specific template

### Uploads
- `GET /api/upload` - List user's uploaded templates
- `POST /api/upload` - Upload filled template

### Drafts
- `GET /api/drafts` - List user's drafts
- `POST /api/drafts` - Create new draft
- `PUT /api/drafts/[id]` - Update draft
- `DELETE /api/drafts/[id]` - Delete draft

### Activity Logs
- `GET /api/activity-logs` - List user's activity
- `POST /api/activity-logs` - Log new activity

### Authentication
- `GET /api/auth/signin` - Sign in page
- `GET /api/auth/signout` - Sign out
- `POST /api/auth/callback` - Auth callback

## 📊 Database Schema

Your database includes these tables:

### Users
- `id` - Unique user ID
- `name` - User's full name
- `username` - Unique username
- `password` - Hashed password
- `role` - ADMIN or USER
- `createdAt/updatedAt` - Timestamps

### Templates
- `id` - Unique template ID
- `name` - Template name
- `fileName` - Original file name
- `fileUrl` - Vercel Blob URL
- `fileSize` - File size in bytes
- `financialYear` - Year the template is for
- `uploadedBy` - User who uploaded it

### Uploaded Templates
- `id` - Unique upload ID
- `userId` - User who uploaded
- `templateId` - Reference to template
- `fileName` - Original file name
- `fileUrl` - Vercel Blob URL
- `fileSize` - File size in bytes
- `financialYear` - Year the data is for
- `status` - PENDING, APPROVED, REJECTED

### Drafts
- `id` - Unique draft ID
- `userId` - User who created draft
- `uploadedTemplateId` - Reference to uploaded template
- `draftNumber` - Draft version number
- `draftType` - ADMIN or USER
- `fileName` - Draft file name
- `fileUrl` - Vercel Blob URL
- `fileSize` - File size in bytes
- `financialYear` - Year the draft is for
- `status` - PENDING, APPROVED, REJECTED, FINAL
- `isFinal` - Whether this is the final version

### Activity Logs
- `id` - Unique log ID
- `userId` - User who performed action
- `action` - Type of action (LOGIN, UPLOAD_TEMPLATE, etc.)
- `details` - Additional details about the action
- `createdAt` - When the action occurred

## 🚀 Deployment

### 1. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### 2. Environment Variables in Production
Set these in your Vercel project settings:

```env
POSTGRES_URL="your-neon-production-url"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## 🔍 Testing the Backend

### 1. Test Database Connection
```bash
# Open Prisma Studio
npm run db:studio
```

### 2. Test File Upload
1. Go to your app
2. Try uploading a file
3. Check Vercel Blob dashboard for the file
4. Check database for the record

### 3. Test API Endpoints
```bash
# Test templates endpoint
curl rd bhttp://localhost:3000/api/templates

# Test upload endpoint (with authentication)
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.xlsx" \
  -F "templateId=template-id" \
  -F "financialYear=2024"
```

## 📈 Monitoring

### Vercel Blob Dashboard
- Monitor file uploads/downloads
- Check storage usage
- View file access logs

### Neon Database Dashboard
- Monitor database performance
- Check query logs
- View connection metrics

### Vercel Analytics
- Monitor API endpoint usage
- Check error rates
- View performance metrics

## 🔒 Security Considerations

1. **Authentication**: All API routes require authentication
2. **File Validation**: Only Excel/CSV files are accepted
3. **File Size Limits**: Consider implementing size limits
4. **Access Control**: Admin-only routes are protected
5. **Environment Variables**: Never commit secrets to git

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `POSTGRES_URL` environment variable
   - Verify Neon database is running
   - Check network connectivity

2. **File Upload Failed**
   - Check `BLOB_READ_WRITE_TOKEN`
   - Verify Vercel Blob store exists
   - Check file size limits

3. **Authentication Issues**
   - Check `NEXTAUTH_SECRET`
   - Verify `NEXTAUTH_URL` matches your domain
   - Check session configuration

### Debug Commands
```bash
# Check database connection
npx prisma db pull

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# View database logs
npx prisma studio

# Check environment variables
echo $POSTGRES_URL
echo $BLOB_READ_WRITE_TOKEN
```

## 📚 Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---

**Your backend is now fully integrated with Vercel Blob Storage and Neon PostgreSQL! 🎉**



