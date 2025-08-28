import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  return await setupDatabase();
}

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Test database connection first
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!existingAdmin) {
      console.log('📝 Creating admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('password', 10);
      
      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          username: 'admin',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin user created:', adminUser.username);
    } else {
      console.log('✅ Admin user already exists');
    }

    // Check if regular users exist
    const existingUsers = await prisma.user.findMany({
      where: {
        username: { in: ['john', 'jane'] }
      }
    });

    if (existingUsers.length < 2) {
      console.log('📝 Creating regular users...');
      
      const hashedPassword = await bcrypt.hash('password', 10);
      
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
    } else {
      console.log('✅ Regular users already exist');
    }

    console.log('🎉 Database setup completed successfully!');
    
    return NextResponse.json({ 
      message: 'Database setup completed successfully',
      adminCreated: !existingAdmin
    });
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json(
      { error: 'Database setup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
