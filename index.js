// Root index.js for Render deployment
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Influencore Backend...');
console.log('📁 Current directory:', __dirname);

// Start the backend server
const backendPath = path.join(__dirname, 'backend', 'index.js');
console.log('📂 Backend path:', backendPath);

const child = spawn('node', [backendPath], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'backend'),
  env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' }
});

child.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`🔚 Backend exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down...');
  child.kill('SIGINT');
}); 