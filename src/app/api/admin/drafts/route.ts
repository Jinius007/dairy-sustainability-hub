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
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const financialYear = formData.get("financialYear") as string;

    if (!file || !userId || !financialYear) {
      return NextResponse.json(
        { error: 'File, user ID, and financial year are required' },
        { status: 400 }
      );
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Get the next odd draft number for this user (1, 3, 5, 7...)
    const existingDrafts = await prisma.draft.findMany({
      where: { 
        userId: userId,
        draftType: "ADMIN" // Only count admin drafts
      },
      orderBy: { draftNumber: 'desc' },
      take: 1
    });

    let draftNumber = 1; // Start with draft 1 for admin
    if (existingDrafts.length > 0) {
      draftNumber = existingDrafts[0].draftNumber + 2; // Next odd number
    }

    // Create the draft
    const newDraft = await prisma.draft.create({
      data: {
        userId: userId,
        draftNumber,
        draftType: "ADMIN",
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        financialYear,
        status: "PENDING_REVIEW"
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
