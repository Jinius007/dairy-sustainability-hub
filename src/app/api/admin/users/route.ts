import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllUsers, addMockUser, deleteMockUser } from '@/lib/mock-users';
import { logUserAction } from '@/lib/mock-activity-logs';

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

    const users = getAllUsers();
    return NextResponse.json(users);
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

    const { name, username, password, role } = await request.json();

    if (!name || !username || !password || !role) {
      return NextResponse.json(
        { error: 'Name, username, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['USER', 'ADMIN'].includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: 'Role must be either USER or ADMIN' },
        { status: 400 }
      );
    }

    try {
      const newUser = addMockUser({
        name,
        username,
        password,
        role: role.toUpperCase()
      });

      // Log the user creation
      logUserAction(
        session.user.id,
        session.user.username || 'admin',
        session.user.role,
        'CREATE',
        newUser.id,
        username,
        `Created new ${role.toLowerCase()} account`
      );

      console.log('User created successfully:', {
        userId: newUser.id,
        username: newUser.username,
        role: newUser.role,
        createdBy: session.user.username
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message === 'Username already exists') {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const deletedUser = deleteMockUser(id);
    
    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Log the user deletion
    logUserAction(
      session.user.id,
      session.user.username || 'admin',
      session.user.role,
      'DELETE',
      id,
      deletedUser.username,
      `Deleted user account`
    );

    console.log('User deleted successfully:', {
      deletedUserId: id,
      deletedUsername: deletedUser.username,
      deletedBy: session.user.username
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


