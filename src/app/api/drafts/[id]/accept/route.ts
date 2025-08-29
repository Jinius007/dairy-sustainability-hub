import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateDraftStatus } from "@/lib/mock-drafts";
import { logDraftAction } from "@/lib/mock-activity-logs";

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

    // Update the draft to mark it as accepted/final
    const updatedDraft = updateDraftStatus(draftId, "FINAL", "Draft accepted as final");
    
    if (!updatedDraft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    // Verify user owns this draft
    if (updatedDraft.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied - you can only accept your own drafts" },
        { status: 403 }
      );
    }

    // Log activity
    logDraftAction(
      session.user.id,
      session.user.username || 'unknown',
      session.user.role,
      'ACCEPT',
      draftId,
      updatedDraft.fileName,
      `Accepted draft ${updatedDraft.draftNumber} as final`
    );

    console.log(`User ${session.user.username} accepted draft ${draftId} as final`);

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("Error accepting draft:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
