import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addMockUpload } from '@/app/api/admin/uploads/route';

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

    // Return mock uploads for now
    const mockUploads = [
      {
        id: "1",
        fileName: "john-sustainability-2024.xlsx",
        fileUrl: "/uploads/john-sustainability-2024.xlsx",
        fileSize: 1536000,
        financialYear: "2024",
        status: "PENDING",
        userId: session.user.id,
        templateId: "1",
        createdAt: new Date("2024-08-20"),
        updatedAt: new Date("2024-08-20"),
        template: {
          name: "ESG Sustainability Report Template 2024",
          financialYear: "2024"
        }
      }
    ];

    return NextResponse.json(mockUploads);
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

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Only Excel files (.xlsx, .xls) are allowed' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Create upload object and add to admin's view
    const upload = {
      fileName: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      financialYear,
      userId: session.user.id,
      templateId,
      status: 'PENDING',
      user: {
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
      },
      template: {
        name: "ESG Sustainability Report Template 2024",
        financialYear: "2024"
      }
    };

    // Add to admin's uploads list
    const savedUpload = addMockUpload(upload);

    console.log('File uploaded successfully:', {
      uploadId: savedUpload.id,
      fileName: file.name,
      blobUrl: blob.url,
      uploadedBy: session.user.username
    });

    return NextResponse.json(savedUpload, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
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
