import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total counts
    const [
      totalUsers,
      totalTemplates,
      totalUploads,
      totalReports,
      recentActivities
    ] = await Promise.all([
      prisma.user.count(),
      prisma.template.count({ where: { isActive: true } }),
      prisma.upload.count(),
      prisma.report.count(),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      }),
    ]);

    // Get uploads by status
    const uploadsByStatus = await prisma.upload.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Get recent uploads
    const recentUploads = await prisma.upload.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    // Get recent reports
    const recentReports = await prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    const stats = {
      totalUsers,
      totalTemplates,
      totalUploads,
      totalReports,
      uploadsByStatus: uploadsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      recentActivities,
      recentUploads,
      recentReports,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}


