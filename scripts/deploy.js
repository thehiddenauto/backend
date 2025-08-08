#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Influencore deployment...');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('📁 Created logs directory');
}

// Function to run commands with error handling
function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log(`✅ ${description} completed successfully`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Function to check if dependencies are installed
function checkDependencies() {
  console.log('\n📦 Checking dependencies...');
  
  const requiredDeps = [
    'react', 'react-dom', 'react-router-dom',
    'express', 'cors', 'helmet', 'compression',
    'stripe', 'jsonwebtoken', 'bcryptjs',
    'nodemailer', 'socket.io', 'winston'
  ];

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const installedDeps = Object.keys(packageJson.dependencies || {});

  const missingDeps = requiredDeps.filter(dep => !installedDeps.includes(dep));
  
  if (missingDeps.length > 0) {
    console.log(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
    console.log('Installing missing dependencies...');
    runCommand('npm install', 'Installing dependencies');
  } else {
    console.log('✅ All dependencies are installed');
  }
}

// Function to build the application
function buildApplication() {
  console.log('\n🏗️  Building application...');
  
  // Check if Vite config exists
  const viteConfigPath = path.join(__dirname, '..', 'vite.config.js');
  if (!fs.existsSync(viteConfigPath)) {
    console.log('📝 Creating Vite configuration...');
    const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})`;
    fs.writeFileSync(viteConfigPath, viteConfig);
  }

  runCommand('npm run build', 'Building frontend');
}

// Function to start the application
function startApplication() {
  console.log('\n🚀 Starting application...');
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    console.log('🌐 Starting in production mode...');
    runCommand('npm start', 'Starting production server');
  } else {
    console.log('🔧 Starting in development mode...');
    runCommand('npm run dev', 'Starting development server');
  }
}

// Function to check environment variables
function checkEnvironment() {
  console.log('\n🔍 Checking environment configuration...');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', 'env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      console.log('📝 Creating .env file from template...');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file. Please configure your environment variables.');
    } else {
      console.log('⚠️  No .env file found. Creating basic configuration...');
      const basicEnv = `
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
`;
      fs.writeFileSync(envPath, basicEnv);
      console.log('✅ Created basic .env file. Please configure your environment variables.');
    }
  } else {
    console.log('✅ .env file exists');
  }
}

// Function to validate the application
function validateApplication() {
  console.log('\n🔍 Validating application...');
  
  // Check if all required files exist
  const requiredFiles = [
    'src/App.jsx',
    'src/main.jsx',
    'server/index.js',
    'package.json'
  ];
  
  const missingFiles = requiredFiles.filter(file => {
    const filePath = path.join(__dirname, '..', file);
    return !fs.existsSync(filePath);
  });
  
  if (missingFiles.length > 0) {
    console.error(`❌ Missing required files: ${missingFiles.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ All required files exist');
}

// Main deployment function
async function deploy() {
  try {
    console.log('🎯 Influencore Deployment Script');
    console.log('================================');
    
    // Validate application structure
    validateApplication();
    
    // Check environment
    checkEnvironment();
    
    // Check and install dependencies
    checkDependencies();
    
    // Build application
    buildApplication();
    
    // Start application
    startApplication();
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📊 Application Status:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend:  http://localhost:3000');
    console.log('   Health:   http://localhost:3000/api/health');
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Configure your .env file with real API keys');
    console.log('   2. Set up Stripe for payment processing');
    console.log('   3. Configure email settings for notifications');
    console.log('   4. Set up a real database for production');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deploy();
}

export { deploy }; 