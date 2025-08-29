import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

// GET - Get all drafts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const drafts = await prisma.draft.findMany({
      where: { userId: session.user.id },
      orderBy: { draftNumber: 'asc' },
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

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

// POST - Create a new draft response (user responding to admin draft)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const uploadId = formData.get("uploadId") as string;
    const comments = formData.get("comments") as string;

    if (!file || !uploadId) {
      return NextResponse.json(
        { error: "File and upload ID are required" },
        { status: 400 }
      );
    }

    // Get the upload to verify it belongs to the user
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: {
        template: true,
        user: true
      }
    });

    if (!upload) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    if (upload.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied - you can only respond to your own uploads" },
        { status: 403 }
      );
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Get the next draft number for this user (should be even number for user responses)
    const existingDrafts = await prisma.draft.findMany({
      where: { userId: session.user.id },
      orderBy: { draftNumber: 'desc' },
      take: 1
    });

    let draftNumber = 2; // Start with draft 2 (user response to draft 1)
    if (existingDrafts.length > 0) {
      // Find the next even number (user response drafts)
      const lastDraftNumber = existingDrafts[0].draftNumber;
      draftNumber = lastDraftNumber + 2; // Skip to next even number
      if (draftNumber % 2 === 1) {
        draftNumber += 1; // Ensure it's even
      }
    }

    // Create the draft
    const newDraft = await prisma.draft.create({
      data: {
        userId: session.user.id,
        draftNumber,
        draftType: "USER",
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

    // Log activity - temporarily commented out to debug
    /*
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_DRAFT",
        details: `Created Draft ${draftNumber} response: ${file.name}`
      }
    });
    */

    console.log('User draft response created successfully:', {
      draftId: newDraft.id,
      fileName: file.name,
      blobUrl: blob.url,
      user: session.user.username,
      draftNumber
    });

    return NextResponse.json(newDraft, { status: 201 });
  } catch (error) {
    console.error("Error creating draft response:", error);
    return NextResponse.json(
      { error: "Failed to create draft response" },
      { status: 500 }
    );
  }
}

// PUT - Update draft status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, status, comments } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Draft ID and status are required" },
        { status: 400 }
      );
    }

    // Get the draft and verify user owns it
    const draft = await prisma.draft.findUnique({
      where: { id }
    });

    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    if (draft.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Update the draft
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
        details: `Updated Draft ${draft.draftNumber} status to: ${status}`
      }
    });
    */

    console.log(`User updated draft ${id} status to: ${status}`);

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("Error updating draft:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 }
    );
  }
}
