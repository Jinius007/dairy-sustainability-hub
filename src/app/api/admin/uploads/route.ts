import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock uploads data (in production, this would be in database)
let mockUploads = [
  {
    id: "1",
    fileName: "john-sustainability-2024.xlsx",
    fileUrl: "/uploads/john-sustainability-2024.xlsx",
    fileSize: 1536000,
    financialYear: "2024",
    status: "PENDING",
    userId: "2", // John's ID
    templateId: "1",
    createdAt: new Date("2024-08-20"),
    updatedAt: new Date("2024-08-20"),
    user: {
      id: "2",
      name: "John Doe",
      username: "john"
    },
    template: {
      name: "ESG Sustainability Report Template 2024",
      financialYear: "2024"
    }
  },
  {
    id: "2",
    fileName: "jane-sustainability-2024.xlsx",
    fileUrl: "/uploads/jane-sustainability-2024.xlsx",
    fileSize: 2048000,
    financialYear: "2024",
    status: "PENDING",
    userId: "3", // Jane's ID
    templateId: "1",
    createdAt: new Date("2024-08-21"),
    updatedAt: new Date("2024-08-21"),
    user: {
      id: "3",
      name: "Jane Smith",
      username: "jane"
    },
    template: {
      name: "ESG Sustainability Report Template 2024",
      financialYear: "2024"
    }
  }
];

// GET - Get all uploads (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Return all uploads with user and template info
    return NextResponse.json(mockUploads);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}

// PUT - Update upload status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Upload ID and status are required' },
        { status: 400 }
      );
    }

    // Find and update upload in mock data
    const uploadIndex = mockUploads.findIndex(upload => upload.id === id);
    if (uploadIndex === -1) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    // Update status
    mockUploads[uploadIndex].status = status;
    mockUploads[uploadIndex].updatedAt = new Date();

    console.log(`Admin updated upload ${id} status to: ${status}`);

    return NextResponse.json(mockUploads[uploadIndex]);
  } catch (error) {
    console.error('Error updating upload:', error);
    return NextResponse.json(
      { error: 'Failed to update upload' },
      { status: 500 }
    );
  }
}

// Function to add new upload (called from user upload endpoint)
export function addMockUpload(upload: any) {
  const newUpload = {
    id: (mockUploads.length + 1).toString(),
    ...upload,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockUploads.push(newUpload);
  return newUpload;
}


