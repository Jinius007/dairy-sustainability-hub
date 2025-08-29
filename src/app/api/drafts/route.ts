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

// POST - Create a new user draft (even numbers: 2, 4, 6, 8...)
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
    const financialYear = formData.get("financialYear") as string;

    if (!file || !financialYear) {
      return NextResponse.json(
        { error: "File and financial year are required" },
        { status: 400 }
      );
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Get the next even draft number for this user (2, 4, 6, 8...)
    const existingDrafts = await prisma.draft.findMany({
      where: { 
        userId: session.user.id,
        draftType: "USER" // Only count user drafts
      },
      orderBy: { draftNumber: 'desc' },
      take: 1
    });

    let draftNumber = 2; // Start with draft 2 for user
    if (existingDrafts.length > 0) {
      draftNumber = existingDrafts[0].draftNumber + 2; // Next even number
    }

    // Create the user draft
    const newDraft = await prisma.draft.create({
      data: {
        userId: session.user.id,
        draftNumber,
        draftType: "USER",
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

    console.log('User draft created successfully:', {
      draftId: newDraft.id,
      fileName: file.name,
      blobUrl: blob.url,
      user: session.user.username,
      draftNumber
    });

    return NextResponse.json(newDraft, { status: 201 });
  } catch (error) {
    console.error("Error creating user draft:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Failed to create user draft", details: error instanceof Error ? error.message : 'Unknown error' },
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

    const { id, status } = await request.json();

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
