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
    const financialYear = searchParams.get("financialYear");

    const templates = await prisma.template.findMany({
      where: financialYear ? { financialYear } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const financialYear = formData.get("financialYear") as string;

    if (!file || !name || !financialYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upload file to Vercel Blob
    const path = `templates/${financialYear}/${file.name}`;
    const blob = await uploadFile(file, path);

    const template = await prisma.template.create({
      data: {
        name,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        financialYear,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error uploading template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
