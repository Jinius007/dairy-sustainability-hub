import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user statistics
    const [totalUploads, totalReports, recentUploads, recentReports] = await Promise.all([
      prisma.upload.count({ where: { userId } }),
      prisma.report.count({ where: { userId } }),
      prisma.upload.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: {
              name: true,
              financialYear: true,
            },
          },
        },
      }),
      prisma.report.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const dashboardData = {
      totalUploads,
      totalReports,
      recentUploads,
      recentReports,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user dashboard' },
      { status: 500 }
    );
  }
}



