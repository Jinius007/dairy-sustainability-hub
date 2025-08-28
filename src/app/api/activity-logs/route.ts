import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const whereClause = userId ? { userId } : {};

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
