import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

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

    const drafts = await prisma.draft.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      },
      orderBy: [
        { userId: 'asc' },
        { draftNumber: 'asc' }
      ]
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

// POST - Create a new draft (admin only)
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

    console.log('Admin draft creation attempt:', {
      fileName: file?.name,
      userId,
      uploadId,
      comments
    });

    if (!file || !userId || !uploadId) {
      console.log('Missing required fields:', { file: !!file, userId: !!userId, uploadId: !!uploadId });
      return NextResponse.json(
        { error: 'File, user ID, and upload ID are required' },
        { status: 400 }
      );
    }

    // Get user and upload to verify they exist
    const [user, upload] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.upload.findUnique({ 
        where: { id: uploadId }
      })
    ]);

    console.log('Database lookup results:', {
      userFound: !!user,
      uploadFound: !!upload,
      uploadUserId: upload?.userId,
      requestedUserId: userId
    });

    if (!user || !upload) {
      return NextResponse.json(
        { error: 'User or upload not found' },
        { status: 404 }
      );
    }

    // Verify the upload belongs to the specified user
    if (upload.userId !== userId) {
      console.log('Upload ownership mismatch:', {
        uploadUserId: upload.userId,
        requestedUserId: userId
      });
      return NextResponse.json(
        { error: 'Upload does not belong to the specified user' },
        { status: 403 }
      );
    }

    // Upload file to Vercel Blob
    console.log('Uploading file to Vercel Blob...');
    const blob = await put(file.name, file, {
      access: 'public',
    });
    console.log('File uploaded successfully:', blob.url);

    // Get the next draft number for this user (should be odd number for admin drafts)
    const existingDrafts = await prisma.draft.findMany({
      where: { userId },
      orderBy: { draftNumber: 'desc' },
      take: 1
    });

    let draftNumber = 1; // Start with draft 1
    if (existingDrafts.length > 0) {
      // Find the next odd number (admin drafts)
      const lastDraftNumber = existingDrafts[0].draftNumber;
      draftNumber = lastDraftNumber + 2; // Skip to next odd number
      if (draftNumber % 2 === 0) {
        draftNumber += 1; // Ensure it's odd
      }
    }

    console.log('Draft number calculation:', {
      existingDraftsCount: existingDrafts.length,
      calculatedDraftNumber: draftNumber
    });

    // Create the draft
    console.log('Creating draft in database...');
    const newDraft = await prisma.draft.create({
      data: {
        userId,
        draftNumber,
        draftType: "ADMIN",
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        financialYear: upload.financialYear,
        status: "PENDING_REVIEW",
        uploadedTemplateId: upload.templateId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    console.log('Draft created successfully:', {
      draftId: newDraft.id,
      draftNumber: newDraft.draftNumber
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_DRAFT",
        details: `Created Draft ${draftNumber} for user ${user.username}: ${file.name}`
      }
    });

    console.log('Admin draft created successfully:', {
      draftId: newDraft.id,
      fileName: file.name,
      blobUrl: blob.url,
      createdFor: user.username,
      draftNumber
    });

    return NextResponse.json(newDraft, { status: 201 });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json(
      { error: 'Failed to create draft', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Update draft status
    const updatedDraft = await prisma.draft.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    // Log activity - temporarily commented out to debug
    /*
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_DRAFT",
        details: `Updated Draft ${updatedDraft.draftNumber} status to: ${status}`
      }
    });
    */

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
