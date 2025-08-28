import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock user storage (in production, this would be in database)
let mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    username: 'admin',
    role: 'ADMIN'
  },
  {
    id: '2',
    name: 'John Doe',
    username: 'john',
    role: 'USER'
  },
  {
    id: '3',
    name: 'Jane Smith',
    username: 'jane',
    role: 'USER'
  }
];

// GET - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    return NextResponse.json(mockUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { name, username, role, password } = await request.json();

    if (!name || !username || !role || !password) {
      return NextResponse.json(
        { error: 'Name, username, role, and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = mockUsers.find(user => user.username === username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      name,
      username,
      role: role.toUpperCase(),
      password // In production, this would be hashed
    };

    mockUsers.push(newUser);

    console.log('New user created:', {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      role: newUser.role
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const { id, name, username, password, role } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        updatedAt: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_USER',
        details: `Updated user: ${user.name} (${user.username})`,
        userId: user.id,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user info before deletion for logging
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, username: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DELETE_USER',
        details: `Deleted user: ${user.name} (${user.username})`,
        userId: id, // This would be the admin's ID in a real app
      },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}


