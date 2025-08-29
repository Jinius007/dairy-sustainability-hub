import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateDraftStatus } from "@/lib/mock-drafts";
import { logDraftAction } from "@/lib/mock-activity-logs";

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

    const updatedDraft = updateDraftStatus(id, status, "Draft marked as final");
    
    if (!updatedDraft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    // Verify user owns this draft
    if (updatedDraft.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied - you can only finalize your own drafts" },
        { status: 403 }
      );
    }

    // Log activity
    logDraftAction(
      session.user.id,
      session.user.username || 'unknown',
      session.user.role,
      'FINALIZE',
      id,
      updatedDraft.fileName,
      `Marked draft ${updatedDraft.draftNumber} as final`
    );

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
