#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌱 EcoQuest Setup Script');
console.log('========================\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 14) {
    console.error('❌ Node.js version 14 or higher is required');
    console.error(`Current version: ${nodeVersion}`);
    process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if package.json exists
if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found. Please run this script from the project root directory.');
    process.exit(1);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
} catch (error) {
    console.error('❌ Failed to install dependencies');
    console.error(error.message);
    process.exit(1);
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
}

// Check .env file
if (!fs.existsSync('.env')) {
    console.log('⚠️  .env file not found. Creating default .env file...');
    const defaultEnv = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
# For local MongoDB (default):
MONGODB_URI=mongodb+srv://poroject:project@cluster0.pl3dl2i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# For MongoDB Atlas (cloud database):
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ecoquest?retryWrites=true&w=majority

# Security Keys
JWT_SECRET=ecoquest-jwt-secret-key-2024
SESSION_SECRET=ecoquest-session-secret-key-2024

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp`;
    
    fs.writeFileSync('.env', defaultEnv);
    console.log('✅ Created .env file with default configuration');
}

// Check MongoDB connection
console.log('\n🔍 Checking MongoDB connection...');

const mongoose = require('mongoose');

async function checkMongoDB() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoquest';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 3000,
        });
        
        console.log('✅ MongoDB connection successful');
        await mongoose.connection.close();
        return true;
    } catch (error) {
        console.log('❌ MongoDB connection failed');
        console.log('\n📋 MongoDB Setup Options:');
        console.log('1. Install MongoDB locally:');
        console.log('   - Download: https://www.mongodb.com/try/download/community');
        console.log('   - Follow installation guide for your OS');
        console.log('   - Start MongoDB service');
        console.log('\n2. Use MongoDB Atlas (Cloud):');
        console.log('   - Create account: https://www.mongodb.com/atlas');
        console.log('   - Create cluster and get connection string');
        console.log('   - Update MONGODB_URI in .env file');
        console.log('\n⚠️  The application will start but database features won\'t work without MongoDB');
        return false;
    }
}

// Run setup
(async () => {
    require('dotenv').config();
    const mongoConnected = await checkMongoDB();
    
    console.log('\n🎉 Setup Complete!');
    console.log('==================');
    console.log('✅ Dependencies installed');
    console.log('✅ Uploads directory created');
    console.log('✅ Environment configuration ready');
    console.log(mongoConnected ? '✅ MongoDB connection verified' : '⚠️  MongoDB setup required');
    
    console.log('\n🚀 To start the application:');
    console.log('   npm start');
    console.log('\n🌐 Application will be available at:');
    console.log('   http://localhost:3000');
    
    console.log('\n👤 Default Admin Credentials:');
    console.log('   Email: admin@ecoquest.com');
    console.log('   Password: admin123');
    
    console.log('\n📚 For more information, check:');
    console.log('   - README.md');
    console.log('   - ISSUES_AND_FIXES.md');
})();
