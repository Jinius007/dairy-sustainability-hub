import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database migration...');

    // SQL script to create all tables and enums
    const migrationSQL = `
      -- CreateEnum
      CREATE TYPE IF NOT EXISTS "UserRole" AS ENUM ('ADMIN', 'USER');

      -- CreateEnum
      CREATE TYPE IF NOT EXISTS "UploadStatus" AS ENUM ('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED');

      -- CreateEnum
      CREATE TYPE IF NOT EXISTS "ReportStatus" AS ENUM ('DRAFT', 'GENERATED', 'PUBLISHED');

      -- CreateEnum
      CREATE TYPE IF NOT EXISTS "ActivityAction" AS ENUM ('LOGIN', 'LOGOUT', 'UPLOAD_TEMPLATE', 'DOWNLOAD_TEMPLATE', 'UPLOAD_DATA', 'DOWNLOAD_DATA', 'GENERATE_REPORT', 'DOWNLOAD_REPORT', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'CREATE_DRAFT', 'UPDATE_DRAFT', 'FINALIZE_DRAFT');

      -- CreateEnum
      CREATE TYPE IF NOT EXISTS "DraftType" AS ENUM ('ADMIN', 'USER');

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "username" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "role" "UserRole" NOT NULL DEFAULT 'USER',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "templates" (
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
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "uploads" (
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
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "reports" (
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
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "drafts" (
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
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "activity_logs" (
          "id" TEXT NOT NULL,
          "action" "ActivityAction" NOT NULL,
          "details" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
      );

      -- CreateIndex
      CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

      -- AddForeignKey (only if they don't exist)
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'uploads_userId_fkey') THEN
              ALTER TABLE "uploads" ADD CONSTRAINT "uploads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
      END $$;

      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'uploads_templateId_fkey') THEN
              ALTER TABLE "uploads" ADD CONSTRAINT "uploads_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
      END $$;

      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reports_userId_fkey') THEN
              ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
      END $$;

      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reports_uploadId_fkey') THEN
              ALTER TABLE "reports" ADD CONSTRAINT "reports_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
      END $$;

      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'drafts_userId_fkey') THEN
              ALTER TABLE "drafts" ADD CONSTRAINT "drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
      END $$;

      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'activity_logs_userId_fkey') THEN
              ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
      END $$;
    `;

    // Execute the migration using Prisma's $executeRawUnsafe
    await prisma.$executeRawUnsafe(migrationSQL);

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
