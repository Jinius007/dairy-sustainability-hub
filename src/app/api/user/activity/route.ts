import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get user's activity logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeStats = searchParams.get('includeStats') === 'true';

    // Build where clause
    const where: any = {
      userId: session.user.id
    };
    
    if (action) {
      where.action = action;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get logs
    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: any = { logs };

    if (includeStats) {
      const stats = await prisma.activityLog.groupBy({
        by: ['action'],
        where: { userId: session.user.id },
        _count: {
          action: true
        }
      });
      
      response.stats = {
        totalActions: logs.length,
        actionsByType: stats.reduce((acc, stat) => {
          acc[stat.action] = stat._count.action;
          return acc;
        }, {} as Record<string, number>),
        recentActivity: logs.slice(0, 10)
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}



