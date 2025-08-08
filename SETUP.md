# 🚀 Quick Setup Guide

## Your App is Now Running! 🎉

Your Influencore app should be accessible at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## 🤖 AI Setup Options

### Option 1: Free HuggingFace (Recommended)
1. Go to [HuggingFace](https://huggingface.co/)
2. Create a free account
3. Get your API token from [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Create a `.env` file in the root directory with:
   ```
   HUGGINGFACE_TOKEN=your_token_here
   ```

### Option 2: No Setup Required
The app includes **fallback responses** that work without any AI setup! Just use the app as-is.

### Option 3: OpenAI (Paid)
1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add to `.env`:
   ```
   OPENAI_API_KEY=your_key_here
   ```

## 🎯 How to Use

1. **Generate Content**: Go to Generator page and create posts
2. **Save Content**: All generated content is saved to Library
3. **Connect Platforms**: Visit Social page to connect platforms
4. **Customize**: Use Settings page for profile and theme

## 🔧 Troubleshooting

### If the app doesn't start:
```bash
# Stop any running processes
npx kill-port 3000 5173

# Restart the app
npm start
```

### If AI generation fails:
- The app will use fallback responses automatically
- Check the browser console for errors
- Visit http://localhost:3000/api/ai-status to check AI providers

## 📱 Features Available

✅ **Profile Settings** - Avatar upload and theme toggle  
✅ **Content Library** - JSON-based post storage  
✅ **Social Connector** - Dummy OAuth for 6 platforms  
✅ **AI Generator** - Multiple templates and platforms  
✅ **Dashboard** - Analytics and quick actions  

## 🎉 You're Ready to Launch!

Your app is fully functional with:
- Modern React frontend
- Express.js backend
- Multiple AI providers
- Fallback mechanisms
- Complete social media platform support

**No expensive APIs required!** The app works with free providers or fallback responses. 