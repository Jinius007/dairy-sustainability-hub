import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's drafts and uploads from database
    const [userDrafts, userUploads] = await Promise.all([
      prisma.draft.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      }),
      prisma.upload.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: {
              name: true,
              financialYear: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      })
    ]);

    // Calculate statistics
    const totalUploads = userUploads.length;
    const totalDrafts = userDrafts.length;
    const pendingDrafts = userDrafts.filter(draft => draft.status === 'PENDING_REVIEW').length;
    const approvedDrafts = userDrafts.filter(draft => draft.status === 'APPROVED').length;

    // Get recent activity (last 5 items)
    const recentActivity = [
      ...userDrafts.map(draft => ({
        type: 'draft',
        id: draft.id,
        title: draft.fileName,
        status: draft.status,
        createdAt: draft.createdAt,
        draftNumber: draft.draftNumber,
        draftType: draft.draftType
      })),
      ...userUploads.map(upload => ({
        type: 'upload',
        id: upload.id,
        title: upload.fileName,
        status: upload.status,
        createdAt: upload.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

    const dashboardData = {
      totalUploads,
      totalDrafts,
      pendingDrafts,
      approvedDrafts,
      recentActivity,
      userDrafts,
      userUploads
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



