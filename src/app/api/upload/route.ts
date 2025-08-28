import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

// GET - Get user's uploads (filtered by user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const uploads = await prisma.upload.findMany({
      where: {
        userId,
      },
      include: {
        template: {
          select: {
            name: true,
            financialYear: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
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

// POST - Upload user data
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const templateId = formData.get('templateId') as string;
    const financialYear = formData.get('financialYear') as string;

    if (!file || !userId || !templateId || !financialYear) {
      return NextResponse.json(
        { error: 'File, user ID, template ID, and financial year are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Only Excel files (.xlsx, .xls) are allowed' },
        { status: 400 }
      );
    }

    // Verify template exists and is active
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        isActive: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or inactive' },
        { status: 404 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Save to database
    const upload = await prisma.upload.create({
      data: {
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        financialYear,
        userId,
        templateId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
        template: {
          select: {
            name: true,
            financialYear: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPLOAD_DATA',
        details: `Uploaded data: ${file.name} for ${financialYear}`,
        userId,
      },
    });

    return NextResponse.json(upload, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// PUT - Update upload status
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Upload ID and status are required' },
        { status: 400 }
      );
    }

    const upload = await prisma.upload.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(upload);
  } catch (error) {
    console.error('Error updating upload:', error);
    return NextResponse.json(
      { error: 'Failed to update upload' },
      { status: 500 }
    );
  }
}

// DELETE - Delete upload
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

    // Get upload info before deletion for logging
    const upload = await prisma.upload.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    await prisma.upload.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DELETE_USER',
        details: `Deleted upload: ${upload.fileName}`,
        userId: upload.userId,
      },
    });

    return NextResponse.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    console.error('Error deleting upload:', error);
    return NextResponse.json(
      { error: 'Failed to delete upload' },
      { status: 500 }
    );
  }
}
