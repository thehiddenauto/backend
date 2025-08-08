# 🎯 Influencore - AI-Powered Social Media Content Generation Platform

A comprehensive SaaS platform that helps content creators, marketers, and businesses generate engaging social media content using AI technology.

## 🚀 Features

### Core Features
- **AI Content Generation**: Generate text posts, video scripts, and hashtags for multiple platforms
- **Multi-Platform Support**: TikTok, Instagram, YouTube, Twitter, LinkedIn, Facebook
- **Content Library**: Save, organize, and manage your generated content
- **Social Media Integration**: Connect your social media accounts (simulated)
- **User Authentication**: Secure login/signup with JWT tokens
- **Subscription Management**: Multiple pricing tiers with Stripe integration
- **Real-time Analytics**: Track your content performance and usage
- **Profile Management**: Customize your profile and preferences

### Technical Features
- **Production-Ready Backend**: Express.js with security headers, rate limiting, and logging
- **Real-time Communication**: Socket.IO for live updates
- **Payment Processing**: Stripe integration for subscriptions
- **Email Notifications**: Welcome emails and notifications
- **Responsive Design**: Modern UI with Tailwind CSS
- **Type Safety**: Full TypeScript support
- **Deployment Ready**: Docker and cloud deployment support

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Stripe** - Payment processing
- **Nodemailer** - Email sending
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Concurrently** - Run multiple commands

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/influencore/platform.git
   cd platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/api/health

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret-key

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@influencore.com

# AI Providers (Optional)
OPENAI_API_KEY=sk-your-openai-api-key
HUGGINGFACE_TOKEN=hf_your_huggingface_token
OLLAMA_ENDPOINT=http://localhost:11434
```

### Required Services

1. **Stripe Account** (for payments)
   - Create account at https://stripe.com
   - Get API keys from dashboard
   - Set up webhook endpoints

2. **Email Service** (for notifications)
   - Gmail with app password
   - Or other SMTP service

3. **AI Services** (optional)
   - OpenAI API key
   - HuggingFace token
   - Local Ollama installation

## 🚀 Deployment

### Development Mode
```bash
npm run dev          # Start frontend only
npm run backend      # Start backend only
npm start           # Start both frontend and backend
```

### Production Mode
```bash
npm run build       # Build frontend
npm run deploy      # Deploy to production
```

### Docker Deployment
```bash
# Build Docker image
docker build -t influencore .

# Run container
docker run -p 3000:3000 -p 5173:5173 influencore
```

### Cloud Deployment

#### Vercel (Frontend)
```bash
npm install -g vercel
vercel --prod
```

#### Railway (Backend)
```bash
npm install -g @railway/cli
railway login
railway up
```

#### Heroku
```bash
heroku create influencore-app
git push heroku main
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Content Generation
- `POST /api/generate-text` - Generate text content
- `POST /api/generate-video` - Generate video scripts

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Content Management
- `GET /api/posts` - Get user posts
- `DELETE /api/posts/:id` - Delete post

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout

### Analytics
- `GET /api/analytics` - Get user analytics

### Health Check
- `GET /api/health` - Application health status

## 🎨 Features Overview

### 1. AI Content Generation
- Generate engaging posts for multiple platforms
- Customizable templates and tones
- Video script generation
- Hashtag suggestions

### 2. Content Library
- Save and organize generated content
- Search and filter posts
- Export content to JSON
- Import existing content

### 3. Social Media Integration
- Connect multiple platforms
- Simulated OAuth flows
- Platform-specific content optimization
- Cross-platform posting (simulated)

### 4. User Dashboard
- Usage analytics
- Content performance metrics
- Subscription management
- Profile customization

### 5. Subscription Plans
- **Starter**: $19/month - 50 generations, 3 platforms
- **Professional**: $49/month - 500 generations, all platforms
- **Enterprise**: $199/month - Unlimited generations, custom features

## 🔧 Development

### Project Structure
```
influencore/
├── src/                    # Frontend source code
│   ├── pages/             # React components
│   ├── styles/            # CSS files
│   └── main.jsx          # Entry point
├── server/                # Backend source code
│   └── index.js          # Express server
├── scripts/               # Deployment scripts
├── logs/                  # Application logs
├── dist/                  # Built frontend
└── package.json          # Dependencies and scripts
```

### Available Scripts
```bash
npm start              # Start development servers
npm run dev            # Start frontend only
npm run backend        # Start backend only
npm run build          # Build for production
npm run preview        # Preview production build
npm run deploy         # Deploy application
npm run test           # Run tests
npm run lint           # Lint code
npm run format         # Format code
```

### Code Style
- ESLint for linting
- Prettier for formatting
- TypeScript for type safety
- Conventional commits

## 🧪 Testing

### Run Tests
```bash
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
└── e2e/              # End-to-end tests
```

## 📈 Monitoring & Analytics

### Built-in Analytics
- User engagement metrics
- Content performance tracking
- Usage statistics
- Platform-specific analytics

### Logging
- Winston for structured logging
- Error tracking and monitoring
- Performance metrics
- Security event logging

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

### Community
- [Discord Server](https://discord.gg/influencore)
- [GitHub Issues](https://github.com/influencore/platform/issues)
- [Email Support](mailto:support@influencore.com)

### Status
- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: August 2024

## 🎉 Acknowledgments

- React team for the amazing framework
- Vite team for the fast build tool
- Tailwind CSS for the utility-first approach
- Stripe for payment processing
- OpenAI for AI capabilities

---

**Made with ❤️ by the Influencore Team**

*Transform your social media presence with AI-powered content generation.* 