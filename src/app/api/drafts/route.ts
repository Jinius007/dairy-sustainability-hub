import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/blob";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const financialYear = searchParams.get("financialYear");

    // Users can only see their own drafts, admins can see all
    const whereClause: any = {};
    if (session.user.role !== "ADMIN") {
      whereClause.userId = session.user.id;
    } else if (userId) {
      whereClause.userId = userId;
    }
    
    if (financialYear) {
      whereClause.financialYear = financialYear;
    }

    const drafts = await prisma.draft.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: [
        { financialYear: "desc" },
        { draftNumber: "desc" },
      ],
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const uploadedTemplateId = formData.get("uploadedTemplateId") as string;
    const draftNumber = parseInt(formData.get("draftNumber") as string);
    const draftType = formData.get("draftType") as "ADMIN" | "USER";
    const financialYear = formData.get("financialYear") as string;

    if (!file || !userId || !draftNumber || !draftType || !financialYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Only admins can create drafts for other users
    if (session.user.role !== "ADMIN" && userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Upload file to Vercel Blob
    const path = `drafts/${userId}/${financialYear}/draft-${draftNumber}-${draftType.toLowerCase()}/${file.name}`;
    const blob = await uploadFile(file, path);

    const draft = await prisma.draft.create({
      data: {
        userId,
        uploadedTemplateId: uploadedTemplateId || null,
        draftNumber,
        draftType,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        financialYear,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_DRAFT",
        details: `Created draft ${draftNumber} (${draftType}) for ${draft.user.name}`,
      },
    });

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error("Error creating draft:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
