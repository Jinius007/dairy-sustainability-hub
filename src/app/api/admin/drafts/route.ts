import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { getAllDrafts, addMockDraft, updateDraftStatus, getDraftsByUserId, getNextDraftNumber, getNextDraftNumberForUpload } from '@/lib/mock-drafts';
import { getAllUploads } from '@/lib/mock-uploads';
import { getAllUsers } from '@/lib/mock-users';

// GET - Get all drafts (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const uploadId = searchParams.get('uploadId');

    let drafts;
    if (userId) {
      drafts = getDraftsByUserId(userId);
    } else {
      drafts = getAllDrafts();
    }

    // Add user and upload information
    const users = getAllUsers();
    const uploads = getAllUploads();
    
    const draftsWithDetails = drafts.map(draft => {
      const user = users.find(u => u.id === draft.userId);
      const upload = uploads.find(u => u.id === draft.uploadId);
      return {
        ...draft,
        user: user || draft.user,
        originalUpload: upload ? {
          fileName: upload.fileName,
          uploadedAt: upload.createdAt
        } : draft.originalUpload
      };
    });

    return NextResponse.json(draftsWithDetails);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

// POST - Create new draft from user upload (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const uploadId = formData.get('uploadId') as string;
    const comments = formData.get('comments') as string;

    if (!file || !userId || !uploadId) {
      return NextResponse.json(
        { error: 'File, user ID, and upload ID are required' },
        { status: 400 }
      );
    }

    // Validate file type - Draft reports can be Word or PDF files
    const allowedExtensions = ['.docx', '.doc', '.pdf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Only Word files (.docx, .doc) or PDF files (.pdf) are allowed for draft reports' },
        { status: 400 }
      );
    }

    // Upload file to Vercel Blob Storage
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Get user and upload information
    const users = getAllUsers();
    const uploads = getAllUploads();
    const user = users.find(u => u.id === userId);
    const upload = uploads.find(u => u.id === uploadId);

    if (!user || !upload) {
      return NextResponse.json(
        { error: 'User or upload not found' },
        { status: 404 }
      );
    }

    // Create draft object
    const draftNumber = getNextDraftNumberForUpload(uploadId);
    const draft = {
      draftNumber,
      draftType: "ADMIN_TO_USER" as const,
      fileName: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      financialYear: upload.financialYear,
      status: "PENDING_REVIEW",
      userId,
      templateId: upload.templateId,
      uploadId,
      comments: comments || `Draft ${draftNumber} created from your uploaded data. Please review and provide feedback.`,
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      },
      template: upload.template,
      originalUpload: {
        fileName: upload.fileName,
        uploadedAt: upload.createdAt
      }
    };

    // Add to shared drafts storage
    const savedDraft = addMockDraft(draft);

    console.log('Draft created successfully:', {
      draftId: savedDraft.id,
      fileName: file.name,
      blobUrl: blob.url,
      createdFor: user.username,
      draftNumber
    });

    return NextResponse.json(savedDraft, { status: 201 });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}

// PUT - Update draft status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id, status, comments } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Draft ID and status are required' },
        { status: 400 }
      );
    }

    // Update draft status using shared function
    const updatedDraft = updateDraftStatus(id, status, comments);
    if (!updatedDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    console.log(`Admin updated draft ${id} status to: ${status}`);

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}
