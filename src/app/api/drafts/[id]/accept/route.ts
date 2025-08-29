import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const draftId = params.id;

    // Get the draft and verify user owns it
    const draft = await prisma.draft.findUnique({
      where: { id: draftId }
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
        { error: "Access denied - you can only accept your own drafts" },
        { status: 403 }
      );
    }

    // Check if this draft is already accepted as final
    if (draft.acceptedAsFinal) {
      return NextResponse.json(
        { error: "This draft is already accepted as final" },
        { status: 400 }
      );
    }

    // Update the draft to mark it as accepted/final
    const updatedDraft = await prisma.draft.update({
      where: { id: draftId },
      data: {
        status: "FINAL",
        isFinal: true,
        acceptedAsFinal: true,
        acceptedBy: session.user.id,
        acceptedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Log activity - temporarily commented out to debug
    /*
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "FINALIZE_DRAFT",
        details: `Accepted Draft ${draft.draftNumber} as final: ${draft.fileName}`
      }
    });
    */

    console.log(`User ${session.user.username} accepted draft ${draftId} as final`);

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("Error accepting draft:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
