import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Run migration (can be called directly from browser)
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting database migration...');

    // Execute each command separately
    const commands = [
      // Create enums
      `DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
      
      `DO $$ BEGIN
        CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
      
      `DO $$ BEGIN
        CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'GENERATED', 'PUBLISHED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
      
      `DO $$ BEGIN
        CREATE TYPE "ActivityAction" AS ENUM ('LOGIN', 'LOGOUT', 'UPLOAD_TEMPLATE', 'DOWNLOAD_TEMPLATE', 'UPLOAD_DATA', 'DOWNLOAD_DATA', 'GENERATE_REPORT', 'DOWNLOAD_REPORT', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'CREATE_DRAFT', 'UPDATE_DRAFT', 'FINALIZE_DRAFT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
      
      `DO $$ BEGIN
        CREATE TYPE "DraftType" AS ENUM ('ADMIN', 'USER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,

      // Create tables
      `CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "username" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "role" "UserRole" NOT NULL DEFAULT 'USER',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );`,

      `CREATE TABLE IF NOT EXISTS "templates" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileUrl" TEXT NOT NULL,
          "fileSize" INTEGER NOT NULL,
          "financialYear" TEXT NOT NULL,
          "description" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "uploadedBy" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
      );`,

      `CREATE TABLE IF NOT EXISTS "uploads" (
          "id" TEXT NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileUrl" TEXT NOT NULL,
          "fileSize" INTEGER NOT NULL,
          "financialYear" TEXT NOT NULL,
          "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
          "userId" TEXT NOT NULL,
          "templateId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
      );`,

      `CREATE TABLE IF NOT EXISTS "reports" (
          "id" TEXT NOT NULL,
          "reportName" TEXT NOT NULL,
          "fileUrl" TEXT NOT NULL,
          "fileSize" INTEGER NOT NULL,
          "financialYear" TEXT NOT NULL,
          "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
          "userId" TEXT NOT NULL,
          "uploadId" TEXT,
          "generatedBy" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
      );`,

      `CREATE TABLE IF NOT EXISTS "drafts" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "uploadedTemplateId" TEXT,
          "draftNumber" INTEGER NOT NULL,
          "draftType" "DraftType" NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileUrl" TEXT NOT NULL,
          "fileSize" INTEGER NOT NULL,
          "financialYear" TEXT NOT NULL,
          "isFinal" BOOLEAN NOT NULL DEFAULT false,
          "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
          "acceptedAsFinal" BOOLEAN NOT NULL DEFAULT false,
          "acceptedBy" TEXT,
          "acceptedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
      );`,

      `CREATE TABLE IF NOT EXISTS "activity_logs" (
          "id" TEXT NOT NULL,
          "action" "ActivityAction" NOT NULL,
          "details" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
      );`,

      // Create indexes
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");`
    ];

    // Execute each command separately
    for (let i = 0; i < commands.length; i++) {
      console.log(`Executing command ${i + 1}/${commands.length}...`);
      await prisma.$executeRawUnsafe(commands[i]);
    }

    console.log('✅ Database migration completed successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully!' 
    });

  } catch (error) {
    console.error('❌ Database migration failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Run migration (alternative method)
export async function POST(request: NextRequest) {
  return GET(request);
}
