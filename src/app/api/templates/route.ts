import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

// GET - Get all active templates (for users to download)
export async function GET() {
  try {
    // Return mock templates for now
    const templates = [
      {
        id: "1",
        name: "ESG Sustainability Report Template 2024",
        fileName: "esg-sustainability-template-2024.xlsx",
        fileUrl: "/templates/esg-sustainability-template-2024.xlsx",
        fileSize: 1024000,
        financialYear: "2024",
        description: "Comprehensive ESG (Environmental, Social, Governance) sustainability reporting template for 2024",
        isActive: true,
        uploadedBy: "1",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
      }
    ];
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST - Upload new template (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const financialYear = formData.get('financialYear') as string;
    const description = formData.get('description') as string;

    if (!file || !name || !financialYear) {
      return NextResponse.json(
        { error: 'File, name, and financial year are required' },
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

    // Upload file to Vercel Blob Storage
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Create template object (mock data for now)
    const template = {
      id: Date.now().toString(),
      name,
      fileName: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      financialYear,
      description,
      isActive: true,
      uploadedBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Template uploaded successfully:', {
      templateId: template.id,
      fileName: file.name,
      blobUrl: blob.url,
      uploadedBy: session.user.username
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error uploading template:', error);
    return NextResponse.json(
      { error: 'Failed to upload template' },
      { status: 500 }
    );
  }
}

// PUT - Update template
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id, name, description, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
