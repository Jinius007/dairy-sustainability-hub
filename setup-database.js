const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Test database connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!existingAdmin) {
      console.log('Creating admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
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

    // Create some default users for testing
    const defaultUsers = [
      { name: 'John Doe', username: 'john', password: 'password123', role: 'USER' },
      { name: 'Jane Smith', username: 'jane', password: 'password123', role: 'USER' }
    ];

    for (const userData of defaultUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        await prisma.user.create({
          data: {
            name: userData.name,
            username: userData.username,
            password: hashedPassword,
            role: userData.role
          }
        });
        
        console.log(`✅ Created user: ${userData.username}`);
      } else {
        console.log(`✅ User already exists: ${userData.username}`);
      }
    }

    console.log('✅ Database setup completed successfully!');
    console.log('\n📋 Default credentials:');
    console.log('Admin: admin / admin123');
    console.log('John: john / password123');
    console.log('Jane: jane / password123');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
