# Dairy Sustainability Reporting Hub

A comprehensive platform for Milk Unions and Milk Producer Companies to manage sustainability reporting with admin and user roles, template management, and draft workflow.

## Features

### Admin Features
- **User Management**: Create, update, and delete users with role-based access
- **Template Management**: Upload blank sustainability reporting templates for each financial year
- **Draft Management**: Create and manage draft reports for users
- **Activity Monitoring**: View detailed activity logs for all users
- **File Storage**: Secure file storage using Vercel Blob

### User Features
- **Template Download**: Download blank templates for the current financial year
- **Data Upload**: Upload filled templates and supporting documents
- **Draft Workflow**: Participate in the draft review process (Admin ↔ User alternating)
- **History View**: Access previous years' templates and final reports
- **Role-based Access**: Users can only see their own data and reports

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL (Vercel)
- **Authentication**: NextAuth.js with credentials provider
- **File Storage**: Vercel Blob Storage
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL database
- Vercel account (for deployment)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   POSTGRES_URL="postgresql://username:password@host:port/database"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Vercel Blob
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push
   ```

5. **Create initial admin user**
   ```bash
   # Start the development server
   npm run dev
   ```
   
   Then use Prisma Studio to create an admin user:
   ```bash
   npm run db:studio
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:

- **User**: Admin and regular users with role-based access
- **Template**: Blank templates uploaded by admins
- **UploadedTemplate**: Filled templates uploaded by users
- **Draft**: Draft reports in the workflow process
- **Comment**: Comments on drafts
- **ActivityLog**: User activity tracking

## Deployment to Vercel

1. **Push your code to GitHub**

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the Next.js framework

3. **Set up environment variables in Vercel**
   - `POSTGRES_URL`: Your Neon PostgreSQL connection string
   - `NEXTAUTH_URL`: Your production URL
   - `NEXTAUTH_SECRET`: A secure random string
   - `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token

4. **Deploy**
   - Vercel will automatically build and deploy your application
   - The first deployment will set up the database schema

## Workflow

### Admin Workflow
1. Create users with username and password
2. Upload blank sustainability templates for each financial year
3. Monitor user uploads and create draft reports
4. Review and approve user drafts
5. Track activity logs

### User Workflow
1. Download blank templates for the current year
2. Fill in the template with sustainability data
3. Upload the completed template
4. Review admin drafts and provide feedback
5. Accept final reports or request changes
6. Access historical data from previous years

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth authentication

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Templates
- `GET /api/templates` - List templates (filtered by year)
- `POST /api/templates` - Upload template (admin only)

### Uploads
- `POST /api/upload` - Upload filled template (users)

### Drafts
- `GET /api/drafts` - List drafts (user-specific or all for admin)
- `POST /api/drafts` - Create draft
- `POST /api/drafts/[id]/accept` - Accept draft as final

### Activity Logs
- `GET /api/activity-logs` - List activity logs (admin only)

## Security Features

- Role-based access control (Admin/User)
- Password hashing with bcrypt
- Session-based authentication
- File upload validation
- User data isolation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
