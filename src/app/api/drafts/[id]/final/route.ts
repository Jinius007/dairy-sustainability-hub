import { NextRequest, NextResponse } from "next/server";
import { markDraftAsFinal } from "@/lib/mock-drafts";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (status !== "FINAL") {
      return NextResponse.json(
        { error: "Invalid status. Only 'FINAL' is allowed." },
        { status: 400 }
      );
    }

    const updatedDraft = markDraftAsFinal(id);
    
    if (!updatedDraft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("Error marking draft as final:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
