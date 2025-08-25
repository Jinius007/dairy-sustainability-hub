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

    // Update the draft to mark it as final
    const updatedDraft = await prisma.draft.update({
      where: {
        id: draftId,
        userId: session.user.id, // Users can only accept their own drafts
      },
      data: {
        isFinal: true,
        status: "FINAL",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "FINALIZE_DRAFT",
        details: `Accepted draft ${updatedDraft.draftNumber} as final`,
      },
    });

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("Error accepting draft:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
