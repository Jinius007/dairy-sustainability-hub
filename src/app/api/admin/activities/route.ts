import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllActivityLogs, getActivityLogsByUserId, getFilteredActivityLogs, getActivityStats } from '@/lib/mock-activity-logs';

// GET - Get activity logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const role = searchParams.get('role');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeStats = searchParams.get('includeStats') === 'true';

    let logs;

    if (userId) {
      // Get logs for specific user
      logs = getActivityLogsByUserId(userId);
    } else if (username || role || action || startDate || endDate) {
      // Get filtered logs
      logs = getFilteredActivityLogs({
        username: username || undefined,
        role: role || undefined,
        action: action || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
    } else {
      // Get all logs
      logs = getAllActivityLogs();
    }

    const response: any = { logs };

    if (includeStats) {
      const stats = getActivityStats(userId || undefined);
      response.stats = stats;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}



