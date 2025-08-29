import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { getAllTemplates, addMockTemplate, updateMockTemplate, deleteMockTemplate, replaceMockTemplate, getTemplateHistory } from '@/lib/mock-templates';

// GET - Get all active templates (for users to download)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const financialYear = searchParams.get('financialYear');
    const includeHistory = searchParams.get('includeHistory') === 'true';
    
    if (includeHistory && financialYear) {
      // Return template history for admin view
      const templates = getTemplateHistory(financialYear);
      return NextResponse.json(templates);
    } else {
      // Return only active templates for users
      const templates = getAllTemplates();
      return NextResponse.json(templates);
    }
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
    const replaceExisting = formData.get('replaceExisting') === 'true';
    const existingTemplateId = formData.get('existingTemplateId') as string;

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

    // Create template object
    const templateData = {
      name,
      fileName: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      financialYear,
      description: description || `Template for ${financialYear}`,
      isActive: true,
      uploadedBy: session.user.id
    };

    let savedTemplate;

    if (replaceExisting && existingTemplateId) {
      // Replace existing template (creates new version, deactivates old)
      savedTemplate = replaceMockTemplate(existingTemplateId, templateData);
      if (!savedTemplate) {
        return NextResponse.json(
          { error: 'Existing template not found' },
          { status: 404 }
        );
      }
    } else {
      // Add new template
      savedTemplate = addMockTemplate(templateData);
    }

    console.log('Template uploaded successfully:', {
      templateId: savedTemplate.id,
      fileName: file.name,
      blobUrl: blob.url,
      uploadedBy: session.user.username,
      version: savedTemplate.version,
      action: replaceExisting ? 'replaced' : 'created'
    });

    return NextResponse.json(savedTemplate, { status: 201 });
  } catch (error) {
    console.error('Error uploading template:', error);
    return NextResponse.json(
      { error: 'Failed to upload template' },
      { status: 500 }
    );
  }
}

// PUT - Update template metadata (creates new version)
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

    // Update template using shared function (creates new version)
    const updatedTemplate = updateMockTemplate(id, {
      name: name || undefined,
      description: description || undefined,
      isActive: isActive !== undefined ? isActive : undefined,
    });

    if (!updatedTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    console.log(`Template ${id} updated to version ${updatedTemplate.version}`);

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template (soft delete - sets as inactive)
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

    // Delete template using shared function (soft delete)
    const deletedTemplate = deleteMockTemplate(id);
    
    if (!deletedTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    console.log(`Template ${id} soft deleted (set as inactive)`);

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
