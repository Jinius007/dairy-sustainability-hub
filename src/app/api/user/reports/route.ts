import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDraftsByUserId } from '@/lib/mock-drafts';
import { getUploadsByUserId } from '@/lib/mock-uploads';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's drafts and uploads using mock data
    const userDrafts = getDraftsByUserId(userId);
    const userUploads = getUploadsByUserId(userId);

    // Combine drafts and uploads as "reports"
    const reports = [
      ...userDrafts.map(draft => ({
        id: draft.id,
        type: 'draft',
        fileName: draft.fileName,
        status: draft.status,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
        draftNumber: draft.draftNumber,
        draftType: draft.draftType,
        financialYear: draft.financialYear,
        comments: draft.comments,
        fileUrl: draft.fileUrl,
        fileSize: draft.fileSize
      })),
      ...userUploads.map(upload => ({
        id: upload.id,
        type: 'upload',
        fileName: upload.fileName,
        status: upload.status,
        createdAt: upload.createdAt,
        updatedAt: upload.updatedAt,
        financialYear: upload.financialYear,
        fileUrl: upload.fileUrl,
        fileSize: upload.fileSize
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user reports' },
      { status: 500 }
    );
  }
}



