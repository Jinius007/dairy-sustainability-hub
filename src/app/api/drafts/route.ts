import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { getDraftsByUserId, addMockDraft, updateDraftStatus, getNextDraftNumber, getNextDraftNumberForUpload } from '@/lib/mock-drafts';
import { getAllUploads } from '@/lib/mock-uploads';

// GET - Get user's drafts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get drafts for the current user
    const drafts = getDraftsByUserId(session.user.id);
    
    // Add upload information
    const uploads = getAllUploads();
    const userUploads = uploads.filter(upload => upload.userId === session.user.id);
    
    const draftsWithDetails = drafts.map(draft => {
      const upload = userUploads.find(u => u.id === draft.uploadId);
      return {
        ...draft,
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

// POST - User responds to admin draft
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
    const uploadId = formData.get('uploadId') as string;
    const comments = formData.get('comments') as string;

    if (!file || !uploadId) {
      return NextResponse.json(
        { error: 'File and upload ID are required' },
        { status: 400 }
      );
    }

    // Validate file type - User responses to drafts can be Word or PDF files
    const allowedExtensions = ['.docx', '.doc', '.pdf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Only Word files (.docx, .doc) or PDF files (.pdf) are allowed for draft responses' },
        { status: 400 }
      );
    }

    // Upload file to Vercel Blob Storage
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Get upload information
    const uploads = getAllUploads();
    const upload = uploads.find(u => u.id === uploadId && u.userId === session.user.id);

    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found or access denied' },
        { status: 404 }
      );
    }

    // Create draft response object
    const draftNumber = getNextDraftNumberForUpload(uploadId);
    const draft = {
      draftNumber,
      draftType: "USER_TO_ADMIN" as const,
      fileName: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      financialYear: upload.financialYear,
      status: "PENDING_REVIEW",
      userId: session.user.id,
      templateId: upload.templateId,
      uploadId,
      comments: comments || `Response to draft ${draftNumber - 1}. Please review the changes.`,
      user: {
        id: session.user.id,
        name: session.user.name || 'Unknown User',
        username: session.user.username || 'unknown'
      },
      template: upload.template,
      originalUpload: {
        fileName: upload.fileName,
        uploadedAt: upload.createdAt
      }
    };

    // Add to shared drafts storage
    const savedDraft = addMockDraft(draft);

    console.log('User draft response created successfully:', {
      draftId: savedDraft.id,
      fileName: file.name,
      blobUrl: blob.url,
      user: session.user.username,
      draftNumber
    });

    return NextResponse.json(savedDraft, { status: 201 });
  } catch (error) {
    console.error('Error creating draft response:', error);
    return NextResponse.json(
      { error: 'Failed to create draft response' },
      { status: 500 }
    );
  }
}

// PUT - User updates draft status (e.g., mark as reviewed)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    // Verify user owns this draft
    if (updatedDraft.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    console.log(`User updated draft ${id} status to: ${status}`);

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}
