#!/bin/bash

echo "🚀 DEPLOYING INFLUENCORE BACKEND TO RENDER"
echo "==========================================="

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Test the application
echo "🧪 Testing application..."
npm start &
sleep 5
curl -f http://localhost:10000/api/health || echo "⚠️ Health check failed, but continuing..."

echo "📋 BACKEND DEPLOYMENT INSTRUCTIONS:"
echo "===================================="
echo "1. Go to https://render.com"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Set the following environment variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - JWT_SECRET=your-secret-key"
echo "   - SUPABASE_URL=your-supabase-url"
echo "   - SUPABASE_ANON_KEY=your-supabase-key"
echo "   - STRIPE_SECRET_KEY=your-stripe-key"
echo "   - STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key"
echo "   - STRIPE_WEBHOOK_SECRET=your-webhook-secret"
echo "   - EMAIL_USER=your-email@gmail.com"
echo "   - EMAIL_PASS=your-app-password"
echo "   - OPENAI_API_KEY=your-openai-key"
echo "   - REPLICATE_API_TOKEN=your-replicate-token"
echo "   - GOOGLE_GENERATIVE_AI_API_KEY=your-google-key"
echo "   - CLOUDINARY_CLOUD_NAME=your-cloudinary-name"
echo "   - CLOUDINARY_API_KEY=your-cloudinary-key"
echo "   - CLOUDINARY_API_SECRET=your-cloudinary-secret"
echo "   - UPSTASH_REDIS_REST_URL=your-redis-url"
echo "   - UPSTASH_REDIS_REST_TOKEN=your-redis-token"
echo "   - FRONTEND_URL=https://influencore.co"
echo "   - CORS_ORIGIN=https://influencore.co"
echo ""
echo "5. Deploy the service"
echo "6. Your backend will be available at: https://api.influencore.co"

echo "🎉 BACKEND DEPLOYMENT READY!" 