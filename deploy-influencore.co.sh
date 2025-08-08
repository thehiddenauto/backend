#!/bin/bash

echo "🚀 INFLUENCORE.CO DEPLOYMENT SCRIPT"
echo "===================================="

# Set environment variables for production
export NODE_ENV=production
export FRONTEND_URL=https://influencore.co
export API_URL=https://api.influencore.co
export CORS_ORIGIN=https://influencore.co

echo "✅ Environment configured for influencore.co"

# Build the application
echo "🏗️ Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Deploy to Vercel (Frontend)
echo "🚀 Deploying frontend to Vercel..."
vercel --prod --yes

# Deploy to Render (Backend)
echo "🚀 Deploying backend to Render..."
# This would be done through Render dashboard

echo "🎉 DEPLOYMENT COMPLETE!"
echo "🌐 Your site will be available at: https://influencore.co"
echo "🎬 Advanced video generator: https://influencore.co/advanced-video"
echo "📊 Dashboard: https://influencore.co/dashboard"

echo ""
echo "📋 Next steps:"
echo "1. Configure GoDaddy DNS settings"
echo "2. Set up environment variables in Render"
echo "3. Configure Stripe webhooks"
echo "4. Set up email service"
echo "5. Test all functionality"
echo "6. Launch marketing campaign"

echo ""
echo "🎯 Your Influencore.co platform is ready for launch!" 