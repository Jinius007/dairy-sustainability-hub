#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Dairy Sustainability Hub Backend...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env.local file...');
    
    const envContent = `# Database Configuration
POSTGRES_URL="postgresql://username:password@host:port/database"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('⚠️  Please update the environment variables with your actual credentials\n');
} else {
    console.log('✅ .env.local file already exists');
}

// Check if node_modules exists
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    console.log('📦 Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed');
    } catch (error) {
        console.error('❌ Failed to install dependencies');
        process.exit(1);
    }
} else {
    console.log('✅ Dependencies already installed');
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
    execSync('npm run db:generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated');
} catch (error) {
    console.error('❌ Failed to generate Prisma client');
    console.log('💡 Make sure your POSTGRES_URL is correct in .env.local');
    process.exit(1);
}

// Check database connection
console.log('🔍 Testing database connection...');
try {
    execSync('npx prisma db pull', { stdio: 'inherit' });
    console.log('✅ Database connection successful');
} catch (error) {
    console.error('❌ Database connection failed');
    console.log('💡 Please check your POSTGRES_URL in .env.local');
    console.log('💡 Make sure your Neon database is running');
    process.exit(1);
}

// Push schema to database
console.log('📊 Setting up database schema...');
try {
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log('✅ Database schema created');
} catch (error) {
    console.error('❌ Failed to create database schema');
    process.exit(1);
}

console.log('\n🎉 Backend setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Update .env.local with your actual credentials');
console.log('2. Create a Vercel Blob store and get your token');
console.log('3. Set up your Neon PostgreSQL database');
console.log('4. Run "npm run dev" to start the development server');
console.log('5. Run "npm run db:studio" to view your database');
console.log('\n📚 For detailed instructions, see BACKEND-SETUP.md');

