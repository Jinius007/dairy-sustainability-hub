import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActivityLogsByUserId, getFilteredActivityLogs } from '@/lib/mock-activity-logs';

// GET - Get user's own activity logs
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
    const resourceType = searchParams.get('resourceType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let logs;

    if (action || resourceType || startDate || endDate) {
      // Get filtered logs for the current user
      logs = getFilteredActivityLogs({
        userId: session.user.id,
        action: action || undefined,
        resourceType: resourceType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
    } else {
      // Get all logs for the current user
      logs = getActivityLogsByUserId(session.user.id);
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}



