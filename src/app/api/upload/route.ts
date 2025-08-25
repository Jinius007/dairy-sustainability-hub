import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/blob";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const templateId = formData.get("templateId") as string;
    const financialYear = formData.get("financialYear") as string;
    const description = formData.get("description") as string;

    if (!file || !templateId || !financialYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upload file to Vercel Blob
    const path = `uploads/${session.user.id}/${financialYear}/${file.name}`;
    const blob = await uploadFile(file, path);

    const uploadedTemplate = await prisma.uploadedTemplate.create({
      data: {
        userId: session.user.id,
        templateId,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        financialYear,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPLOAD_TEMPLATE",
        details: `Uploaded filled template: ${file.name}`,
      },
    });

    return NextResponse.json(uploadedTemplate, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
