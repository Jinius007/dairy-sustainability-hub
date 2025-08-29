import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (status !== "FINAL") {
      return NextResponse.json(
        { error: "Invalid status. Only 'FINAL' is allowed." },
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

    // Verify user owns this draft
    if (draft.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied - you can only finalize your own drafts" },
        { status: 403 }
      );
    }

    // Update the draft
    const updatedDraft = await prisma.draft.update({
      where: { id },
      data: {
        status: status,
        isFinal: true,
        updatedAt: new Date()
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "FINALIZE_DRAFT",
        details: `Marked draft ${draft.draftNumber} as final: ${draft.fileName}`
      }
    });

    console.log(`User ${session.user.username} marked draft ${id} as final`);

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("Error marking draft as final:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
