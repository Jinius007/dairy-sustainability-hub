import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get all statistics
    const [
      totalUsers,
      totalTemplates,
      totalUploads,
      totalDrafts,
      totalActivityLogs,
      uploadsByStatus,
      recentUploads,
      recentReports
    ] = await Promise.all([
      prisma.user.count(),
      prisma.template.count({ where: { isActive: true } }),
      prisma.upload.count(),
      prisma.draft.count(),
      prisma.activityLog.count(),
      prisma.upload.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      prisma.upload.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              username: true
            }
          }
        }
      }),
      prisma.draft.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              username: true
            }
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalTemplates,
      totalUploads,
      totalDrafts,
      totalActivityLogs,
      uploadsByStatus: uploadsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      recentUploads,
      recentReports
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
