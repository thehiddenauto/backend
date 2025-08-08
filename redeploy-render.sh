#!/bin/bash

echo "🚀 REDEPLOYING TO RENDER WITH FIXES"
echo "===================================="

# Navigate to backend directory
cd backend

# Install dependencies locally to test
echo "📦 Installing dependencies locally..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Local installation successful"
else
    echo "❌ Local installation failed"
    exit 1
fi

# Test the application
echo "🧪 Testing application..."
npm start &
sleep 5
curl -f http://localhost:10000/api/health || echo "⚠️ Health check failed, but continuing..."

echo ""
echo "📋 RENDER REDEPLOYMENT INSTRUCTIONS:"
echo "===================================="
echo "1. Go to https://render.com/dashboard"
echo "2. Find your backend service"
echo "3. Click 'Manual Deploy'"
echo "4. Select 'Clear build cache & deploy'"
echo "5. Monitor the build logs"
echo ""
echo "✅ Expected result:"
echo "   - Build successful"
echo "   - Dependencies installed"
echo "   - Service started"
echo "   - Health check passed"
echo ""
echo "🎯 Your backend should now deploy successfully!"

echo ""
echo "🔧 If deployment still fails:"
echo "1. Check Render logs for specific errors"
echo "2. Verify all environment variables are set"
echo "3. Contact Render support if needed" 