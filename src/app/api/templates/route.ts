import { NextRequest, NextResponse } from 'next/server';
import { getTemplates } from '@/lib/mock-data';

// GET - Get all active templates (for users to download)
export async function GET() {
  try {
    const templates = getTemplates().filter(t => t.isActive);
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

    // Mock response for demo
    const template = {
      id: Date.now().toString(),
      name,
      fileName: file.name,
      fileUrl: `/templates/${file.name}`,
      fileSize: file.size,
      financialYear,
      description,
      isActive: true,
      uploadedBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

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
    const { id, name, description, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Mock response for demo
    const template = {
      id,
      name: name || 'Updated Template',
      description: description || 'Updated description',
      isActive: isActive !== undefined ? isActive : true,
      fileName: 'template.xlsx',
      fileUrl: '/templates/template.xlsx',
      fileSize: 1024000,
      financialYear: '2024',
      uploadedBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Mock response for demo
    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
