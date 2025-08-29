import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

// GET - Get user's uploads (filtered by user)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return only the current user's uploads
    const uploads = await prisma.upload.findMany({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        template: {
          select: {
            name: true,
            financialYear: true
          }
        }
      }
    });

    return NextResponse.json(uploads);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}

// POST - Upload filled template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templateId = formData.get('templateId') as string;
    const financialYear = formData.get('financialYear') as string;

    if (!file || !templateId || !financialYear) {
      return NextResponse.json(
        { error: 'File, template ID, and financial year are required' },
        { status: 400 }
      );
    }

    // Get template to verify it exists and is active
    const template = await prisma.template.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!template.isActive) {
      return NextResponse.json(
        { error: 'Template is not active' },
        { status: 400 }
      );
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Create upload record
    const newUpload = await prisma.upload.create({
      data: {
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        financialYear,
        status: 'PENDING',
        userId: session.user.id,
        templateId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        template: {
          select: {
            name: true,
            financialYear: true
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPLOAD_DATA",
        details: `Uploaded filled template: ${file.name} for ${financialYear}`
      }
    });

    console.log('Upload created successfully:', {
      uploadId: newUpload.id,
      fileName: file.name,
      blobUrl: blob.url,
      user: session.user.username,
      template: template.name
    });

    return NextResponse.json(newUpload, { status: 201 });
  } catch (error) {
    console.error('Error creating upload:', error);
    return NextResponse.json(
      { error: 'Failed to create upload' },
      { status: 500 }
    );
  }
}

// PUT - Update upload status (mock implementation)
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Upload ID and status are required' },
        { status: 400 }
      );
    }

    // Mock update - in real app this would update database
    const mockUpload = {
      id,
      status,
      fileName: "mock-file.xlsx",
      fileUrl: "/uploads/mock-file.xlsx",
      fileSize: 1024000,
      financialYear: "2024",
      userId: "1",
      templateId: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        name: "Mock User",
        username: "mockuser"
      }
    };

    return NextResponse.json(mockUpload);
  } catch (error) {
    console.error('Error updating upload:', error);
    return NextResponse.json(
      { error: 'Failed to update upload' },
      { status: 500 }
    );
  }
}

// DELETE - Delete upload (mock implementation)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Upload ID is required' },
        { status: 400 }
      );
    }

    // Mock delete - in real app this would delete from database
    console.log(`Mock delete of upload with ID: ${id}`);

    return NextResponse.json({ 
      message: 'Upload deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting upload:', error);
    return NextResponse.json(
      { error: 'Failed to delete upload' },
      { status: 500 }
    );
  }
}
