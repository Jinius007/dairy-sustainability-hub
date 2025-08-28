import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const reports = await prisma.report.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
        upload: {
          select: {
            fileName: true,
            financialYear: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST - Generate new report
export async function POST(request: NextRequest) {
  try {
    const { userId, uploadId, reportName, financialYear, fileUrl, fileSize } = await request.json();

    if (!userId || !reportName || !financialYear || !fileUrl || !fileSize) {
      return NextResponse.json(
        { error: 'User ID, report name, financial year, file URL, and file size are required' },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reportName,
        fileUrl,
        fileSize,
        financialYear,
        userId,
        uploadId,
        generatedBy: 'admin', // This would be the actual admin user ID
        status: 'GENERATED',
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'GENERATE_REPORT',
        details: `Generated report: ${reportName} for ${report.user.name}`,
        userId: report.userId,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// PUT - Update report
export async function PUT(request: NextRequest) {
  try {
    const { id, reportName, status, fileUrl, fileSize } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (reportName) updateData.reportName = reportName;
    if (status) updateData.status = status;
    if (fileUrl) updateData.fileUrl = fileUrl;
    if (fileSize) updateData.fileSize = fileSize;

    const report = await prisma.report.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_USER',
        details: `Updated report: ${report.reportName}`,
        userId: report.userId,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

// DELETE - Delete report
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Get report info before deletion for logging
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    await prisma.report.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DELETE_USER',
        details: `Deleted report: ${report.reportName} for ${report.user.name}`,
        userId: report.userId,
      },
    });

    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}


