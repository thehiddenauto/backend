#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up FREE services for Influencore...\n');

// Create free .env configuration
const freeEnvConfig = `# Influencore FREE Configuration
# All services are FREE tiers

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5174
API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5174

# =============================================================================
# SECURITY
# =============================================================================
JWT_SECRET=influencore-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
SESSION_SECRET=influencore-session-secret

# =============================================================================
# FREE DATABASE (Supabase - 500MB free)
# =============================================================================
DATABASE_URL=postgresql://postgres:your-password@db.supabase.co:5432/postgres
# Get this from: https://supabase.com/ (free tier)

# =============================================================================
# FREE STRIPE (Test mode - no real charges)
# =============================================================================
STRIPE_SECRET_KEY=sk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_ID_STARTER=price_1234567890
STRIPE_PRICE_ID_PROFESSIONAL=price_0987654321
STRIPE_PRICE_ID_ENTERPRISE=price_1122334455

# =============================================================================
# FREE EMAIL (Gmail - free)
# =============================================================================
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=noreply@influencore.com
EMAIL_FROM_NAME=Influencore
EMAIL_TEMPLATES_PATH=./server/email-templates

# =============================================================================
# FREE AI PROVIDERS
# =============================================================================
HUGGINGFACE_API_KEY=hf_your-huggingface-key-here
REPLICATE_API_TOKEN=r8_your-replicate-token-here
COHERE_API_KEY=your-cohere-api-key-here

# =============================================================================
# FREE FILE STORAGE (Cloudinary - 25GB free)
# =============================================================================
CLOUDINARY_URL=cloudinary://your-api-key:your-api-secret@your-cloud-name
# Get this from: https://cloudinary.com/ (free tier)

# =============================================================================
# FREE ANALYTICS & MONITORING
# =============================================================================
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
# Get this from: https://analytics.google.com/ (free)

# =============================================================================
# FREE SOCIAL MEDIA APIs (Test mode)
# =============================================================================
# Twitter/X API (Test mode)
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-access-token-secret

# Instagram API (Test mode)
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token

# TikTok API (Test mode)
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# YouTube API (Test mode)
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret

# LinkedIn API (Test mode)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Facebook API (Test mode)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Twitch API (Test mode)
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret

# =============================================================================
# RATE LIMITING
# =============================================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false

# =============================================================================
# FEATURE FLAGS
# =============================================================================
ENABLE_VIDEO_GENERATION=true
ENABLE_SOCIAL_POSTING=true
ENABLE_ANALYTICS=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_PAYMENT_PROCESSING=true
ENABLE_USER_REGISTRATION=true
ENABLE_OAUTH_LOGIN=true

# =============================================================================
# FREE REDIS (Upstash - 10,000 requests/month free)
# =============================================================================
REDIS_URL=redis://your-redis-url.upstash.io:6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# =============================================================================
# VIDEO PROCESSING
# =============================================================================
FFMPEG_PATH=/usr/bin/ffmpeg
VIDEO_MAX_SIZE=100MB
VIDEO_ALLOWED_FORMATS=mp4,avi,mov,wmv,flv,webm
VIDEO_OUTPUT_FORMAT=mp4
VIDEO_QUALITY=high

# =============================================================================
# LOGGING
# =============================================================================
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14
`;

// Write the free configuration
fs.writeFileSync('.env', freeEnvConfig);

console.log('✅ Created .env with FREE service configuration\n');

// Create setup instructions
const setupInstructions = `
🎉 FREE SERVICES SETUP GUIDE

📋 STEP-BY-STEP INSTRUCTIONS:

1. 🗄️ FREE DATABASE (Supabase):
   - Go to: https://supabase.com/
   - Sign up with email
   - Create new project
   - Go to Settings → Database
   - Copy the connection string
   - Replace DATABASE_URL in .env

2. 🤖 FREE AI APIs:
   - HuggingFace: https://huggingface.co/settings/tokens
   - Replicate: https://replicate.com/account/api-tokens
   - Cohere: https://cohere.ai/ (sign up for free)

3. 📧 FREE EMAIL (Gmail):
   - Go to: https://myaccount.google.com/security
   - Enable 2-factor authentication
   - Generate App Password
   - Update EMAIL_USER and EMAIL_PASS in .env

4. ☁️ FREE STORAGE (Cloudinary):
   - Go to: https://cloudinary.com/
   - Sign up for free account
   - Get your cloud URL
   - Update CLOUDINARY_URL in .env

5. 📊 FREE ANALYTICS (Google Analytics):
   - Go to: https://analytics.google.com/
   - Create new property
   - Get Measurement ID
   - Update GOOGLE_ANALYTICS_ID in .env

6. 💳 FREE PAYMENT TESTING (Stripe):
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Use test keys (no real charges)
   - Update STRIPE keys in .env

7. 🔗 FREE HOSTING:
   - Frontend: https://vercel.com/ (free tier)
   - Backend: https://railway.app/ (free tier)

📝 YOUR PLATFORM IS READY TO USE!
Access at: http://localhost:5174/

💰 TOTAL COST: $0
🚀 All services are FREE tiers!
`;

// Write setup instructions
fs.writeFileSync('FREE-SETUP-GUIDE.md', setupInstructions);

console.log('✅ Created FREE-SETUP-GUIDE.md\n');

// Create quick start script
const quickStartScript = `#!/bin/bash
echo "🚀 Starting Influencore with FREE services..."

# Install dependencies
npm install

# Start the application
npm start

echo "✅ Influencore is running at http://localhost:5174/"
echo "📝 Check FREE-SETUP-GUIDE.md for API key setup"
`;

fs.writeFileSync('start-free.sh', quickStartScript);

console.log('✅ Created start-free.sh\n');

console.log('🎉 FREE SETUP COMPLETE!');
console.log('');
console.log('📋 NEXT STEPS:');
console.log('1. Read FREE-SETUP-GUIDE.md for detailed instructions');
console.log('2. Get your free API keys from the services listed');
console.log('3. Update the .env file with your keys');
console.log('4. Run: npm start');
console.log('');
console.log('🚀 Your platform is ready: http://localhost:5174/');
console.log('💰 Total cost: $0 (everything is FREE!)'); 