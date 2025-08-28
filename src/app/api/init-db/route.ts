import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  return await initializeDatabase();
}

export async function POST(request: NextRequest) {
  return await initializeDatabase();
}

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Create admin user with hashed password
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Check if admin exists, if not create it
    let adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          username: 'admin',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Create regular users
    const usersToCreate = [
      { name: 'John Doe', username: 'john' },
      { name: 'Jane Smith', username: 'jane' }
    ];
    
    for (const userData of usersToCreate) {
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      });
      
      if (!existingUser) {
        await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
            role: 'USER'
          }
        });
        console.log(`✅ Created user: ${userData.username}`);
      }
    }
    
    console.log('🎉 Database initialization completed!');
    
    return NextResponse.json({ 
      success: true,
      message: 'Database initialized successfully',
      adminCreated: adminUser.username,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database initialization failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
