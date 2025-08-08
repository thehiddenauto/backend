#!/bin/bash

echo "🚀 DEPLOYING INFLUENCORE FRONTEND TO VERCEL"
echo "============================================="

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️ Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod --yes

echo "🎉 FRONTEND DEPLOYMENT COMPLETE!"
echo "🌐 Your frontend will be available at: https://influencore.co" 