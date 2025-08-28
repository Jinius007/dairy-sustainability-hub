const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Set the database URL directly
process.env.POSTGRES_URL = 'postgres://neondb_owner:npg_BG0OSU1LxKJb@ep-hidden-shape-adeef817-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        name: 'Admin User',
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN',
      },
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
      where: { username: 'user' },
      update: {},
      create: {
        name: 'Test User',
        username: 'user',
        password: userPassword,
        role: 'USER',
      },
    });

    // Create a sample template
    const template = await prisma.template.upsert({
      where: { id: 'sample-template' },
      update: {},
      create: {
        id: 'sample-template',
        name: 'Dairy Sustainability Report Template 2024',
        fileName: 'dairy-sustainability-template-2024.xlsx',
        fileUrl: 'https://example.com/template.xlsx',
        fileSize: 1024000, // 1MB
        financialYear: '2024',
        description: 'Comprehensive sustainability reporting template for dairy operations',
        uploadedBy: admin.id,
        isActive: true,
      },
    });

    console.log('✅ Test users created successfully!');
    console.log('📋 Login Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   User: user / user123');
    console.log('📄 Sample template created');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
