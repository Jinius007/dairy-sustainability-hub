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

    const uploads = await prisma.upload.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
        template: {
          select: {
            name: true,
            financialYear: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(uploads);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}

// PUT - Update upload status
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Upload ID and status are required' },
        { status: 400 }
      );
    }

    const upload = await prisma.upload.update({
      where: { id },
      data: { status },
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
        details: `Updated upload status to ${status}: ${upload.fileName}`,
        userId: upload.userId,
      },
    });

    return NextResponse.json(upload);
  } catch (error) {
    console.error('Error updating upload:', error);
    return NextResponse.json(
      { error: 'Failed to update upload' },
      { status: 500 }
    );
  }
}


