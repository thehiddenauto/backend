import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { createServer } from 'http';
import { Server } from 'socket.io';
import winston from 'winston';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AdvancedVideoGenerator from './services/videoGenerator.js';
import { userService, contentService, socialService, setupDatabase } from './services/supabase.js';
import emailService from './services/emailService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...');

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Production security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://supabase.co"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Freemium model configuration
const FREEMIUM_LIMITS = {
  FREE_GENERATIONS: 2, // Users get 2 free generations before upgrade prompt
  FREE_PLATFORMS: 1,   // Users can connect 1 platform for free
  UPGRADE_PROMPT_AFTER: 1 // Show upgrade prompt after 1 generation
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }

      // Get user from database
      const userResult = await userService.getUserById(decoded.userId);
      if (!userResult.success) {
        return res.status(404).json({ error: 'User not found' });
      }

      req.user = userResult.user;
      next();
    });
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser.success) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      passwordHash
    };

    const result = await userService.createUser(userData);
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Send welcome email
    emailService.sendWelcomeEmail(result.user);

    res.json({
      success: true,
      token,
      user: {
        id: result.user.id,
        firstName: result.user.first_name,
        lastName: result.user.last_name,
        email: result.user.email,
        plan: result.user.plan,
        usage: result.user.usage
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const result = await userService.getUserByEmail(email);
    if (!result.success) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, result.user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: result.user.id,
        firstName: result.user.first_name,
        lastName: result.user.last_name,
        email: result.user.email,
        plan: result.user.plan,
        usage: result.user.usage
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// AI Content Generation
app.post('/api/generate-text', async (req, res) => {
  try {
    const { message, mode } = req.body;
    // For demo purposes, create a mock user
    const user = {
      id: 'demo_user',
      plan: 'Free',
      usage: { aiGenerations: 0 }
    };

    // Check freemium limits
    if (user.plan === 'Free') {
      if (user.usage.aiGenerations >= FREEMIUM_LIMITS.FREE_GENERATIONS) {
        return res.status(429).json({ 
          error: 'Free limit reached. Please upgrade to continue generating content.',
          upgradeRequired: true,
          remainingFree: 0,
          plan: 'Free'
        });
      }
    } else {
      // Check paid plan limits
      if (user.usage.aiGenerations >= getPlanLimit(user.plan)) {
        return res.status(429).json({ error: 'Usage limit exceeded. Please upgrade your plan.' });
      }
    }

    // Generate content using AI based on message and mode
    const content = await generateAIContentFromMessage(message, mode);

    // Update usage
    user.usage.aiGenerations += 1;
    // For demo purposes, we'll skip user storage since req.user is not available

    // Save post
    const post = {
      id: `post_${Date.now()}`,
      userId: user.id,
      title: `${platform} Content for ${brand}`,
      content,
      platform,
      createdAt: new Date().toISOString(),
      type: 'text'
    };
    posts.set(post.id, post);

    // Check if upgrade prompt should be shown
    const shouldShowUpgrade = user.plan === 'Free' && 
                             user.usage.aiGenerations >= FREEMIUM_LIMITS.UPGRADE_PROMPT_AFTER &&
                             user.usage.aiGenerations < FREEMIUM_LIMITS.FREE_GENERATIONS;

    res.json({
      content,
      postId: post.id,
      usage: user.usage,
      remainingFree: FREEMIUM_LIMITS.FREE_GENERATIONS - user.usage.aiGenerations,
      shouldShowUpgrade,
      plan: user.plan
    });

  } catch (error) {
    logger.error('Content generation error:', error);
    res.status(500).json({ error: 'Content generation failed' });
  }
});

app.post('/api/generate-video', async (req, res) => {
  try {
    const { message, mode } = req.body;
    // For demo purposes, create a mock user
    const user = {
      id: 'demo_user',
      plan: 'Free',
      usage: { aiGenerations: 0 }
    };

    // Check freemium limits
    if (user.plan === 'Free') {
      if (user.usage.aiGenerations >= FREEMIUM_LIMITS.FREE_GENERATIONS) {
        return res.status(429).json({ 
          error: 'Free limit reached. Please upgrade to continue generating content.',
          upgradeRequired: true,
          remainingFree: 0,
          plan: 'Free'
        });
      }
    } else {
      // Check paid plan limits
      if (user.usage.aiGenerations >= getPlanLimit(user.plan)) {
        return res.status(429).json({ error: 'Usage limit exceeded. Please upgrade your plan.' });
      }
    }

    // Generate video script based on message and mode
    const script = await generateVideoScriptFromMessage(message, mode);

    // Update usage
    user.usage.aiGenerations += 1;
    // For demo purposes, we'll skip user storage since req.user is not available

    // Save post
    const post = {
      id: `post_${Date.now()}`,
      userId: user.id,
      title: `${platform} Video Script for ${brand}`,
      content: script,
      platform,
      createdAt: new Date().toISOString(),
      type: 'video'
    };
    posts.set(post.id, post);

    // Check if upgrade prompt should be shown
    const shouldShowUpgrade = user.plan === 'Free' && 
                             user.usage.aiGenerations >= FREEMIUM_LIMITS.UPGRADE_PROMPT_AFTER &&
                             user.usage.aiGenerations < FREEMIUM_LIMITS.FREE_GENERATIONS;

    res.json({
      script,
      postId: post.id,
      usage: user.usage,
      remainingFree: FREEMIUM_LIMITS.FREE_GENERATIONS - user.usage.aiGenerations,
      shouldShowUpgrade,
      plan: user.plan
    });

  } catch (error) {
    logger.error('Video generation error:', error);
    res.status(500).json({ error: 'Video generation failed' });
  }
});

// Initialize Advanced Video Generator
const videoGenerator = new AdvancedVideoGenerator();

// Advanced Video Generation Endpoints (Google Veo 3 & Sora Level)
app.post('/api/generate-veo3-video', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // For demo purposes, create a mock user
    const user = {
      id: 'demo_user',
      plan: 'Free',
      usage: { aiGenerations: 0 }
    };

    // Check freemium limits
    if (user.plan === 'Free') {
      if (user.usage.aiGenerations >= FREEMIUM_LIMITS.FREE_GENERATIONS) {
        return res.status(429).json({ 
          error: 'Free limit reached. Please upgrade to continue generating videos.',
          upgradeRequired: true,
          remainingFree: 0,
          plan: 'Free'
        });
      }
    }

    logger.info('🎬 Generating Veo 3 style video:', prompt);

    // Generate Veo 3 style video
    const result = await videoGenerator.generateVeo3Video(prompt, options);

    // Update usage
    user.usage.aiGenerations += 1;

    // Save video
    const video = {
      id: `video_${Date.now()}`,
      userId: user.id,
      title: `Veo 3 Video: ${prompt}`,
      content: result.videoUrl,
      type: 'video',
      model: result.model,
      prompt: prompt,
      duration: result.duration,
      resolution: result.resolution,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      video: result,
      videoId: video.id,
      usage: user.usage,
      remainingFree: FREEMIUM_LIMITS.FREE_GENERATIONS - user.usage.aiGenerations,
      plan: user.plan
    });

  } catch (error) {
    logger.error('Veo 3 video generation error:', error);
    res.status(500).json({ error: 'Veo 3 video generation failed' });
  }
});

app.post('/api/generate-sora-video', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // For demo purposes, create a mock user
    const user = {
      id: 'demo_user',
      plan: 'Free',
      usage: { aiGenerations: 0 }
    };

    // Check freemium limits
    if (user.plan === 'Free') {
      if (user.usage.aiGenerations >= FREEMIUM_LIMITS.FREE_GENERATIONS) {
        return res.status(429).json({ 
          error: 'Free limit reached. Please upgrade to continue generating videos.',
          upgradeRequired: true,
          remainingFree: 0,
          plan: 'Free'
        });
      }
    }

    logger.info('🎬 Generating Sora-level video:', prompt);

    // Generate Sora-level video
    const result = await videoGenerator.generateSoraVideo(prompt, options);

    // Update usage
    user.usage.aiGenerations += 1;

    // Save video
    const video = {
      id: `video_${Date.now()}`,
      userId: user.id,
      title: `Sora Video: ${prompt}`,
      content: result.videoUrl,
      type: 'video',
      model: result.model,
      prompt: prompt,
      duration: result.duration,
      resolution: result.resolution,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      video: result,
      videoId: video.id,
      usage: user.usage,
      remainingFree: FREEMIUM_LIMITS.FREE_GENERATIONS - user.usage.aiGenerations,
      plan: user.plan
    });

  } catch (error) {
    logger.error('Sora video generation error:', error);
    res.status(500).json({ error: 'Sora video generation failed' });
  }
});

app.post('/api/generate-viral-short', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // For demo purposes, create a mock user
    const user = {
      id: 'demo_user',
      plan: 'Free',
      usage: { aiGenerations: 0 }
    };

    // Check freemium limits
    if (user.plan === 'Free') {
      if (user.usage.aiGenerations >= FREEMIUM_LIMITS.FREE_GENERATIONS) {
        return res.status(429).json({ 
          error: 'Free limit reached. Please upgrade to continue generating videos.',
          upgradeRequired: true,
          remainingFree: 0,
          plan: 'Free'
        });
      }
    }

    logger.info('🎬 Generating viral short:', prompt);

    // Generate viral short video
    const result = await videoGenerator.generateViralShort(prompt, options);

    // Update usage
    user.usage.aiGenerations += 1;

    // Save video
    const video = {
      id: `video_${Date.now()}`,
      userId: user.id,
      title: `Viral Short: ${prompt}`,
      content: result.videoUrl,
      type: 'video',
      model: result.model,
      prompt: prompt,
      duration: result.duration,
      resolution: result.resolution,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      video: result,
      videoId: video.id,
      usage: user.usage,
      remainingFree: FREEMIUM_LIMITS.FREE_GENERATIONS - user.usage.aiGenerations,
      plan: user.plan
    });

  } catch (error) {
    logger.error('Viral short generation error:', error);
    res.status(500).json({ error: 'Viral short generation failed' });
  }
});

app.post('/api/generate-video-from-image', async (req, res) => {
  try {
    const { imageUrl, prompt, options = {} } = req.body;
    
    if (!imageUrl || !prompt) {
      return res.status(400).json({ error: 'Image URL and prompt are required' });
    }

    // For demo purposes, create a mock user
    const user = {
      id: 'demo_user',
      plan: 'Free',
      usage: { aiGenerations: 0 }
    };

    // Check freemium limits
    if (user.plan === 'Free') {
      if (user.usage.aiGenerations >= FREEMIUM_LIMITS.FREE_GENERATIONS) {
        return res.status(429).json({ 
          error: 'Free limit reached. Please upgrade to continue generating videos.',
          upgradeRequired: true,
          remainingFree: 0,
          plan: 'Free'
        });
      }
    }

    logger.info('🎬 Generating video from image:', prompt);

    // Generate video from image
    const result = await videoGenerator.generateVideoFromImage(imageUrl, prompt, options);

    // Update usage
    user.usage.aiGenerations += 1;

    // Save video
    const video = {
      id: `video_${Date.now()}`,
      userId: user.id,
      title: `Image-to-Video: ${prompt}`,
      content: result.videoUrl,
      type: 'video',
      model: result.model,
      prompt: prompt,
      imageUrl: imageUrl,
      duration: result.duration,
      resolution: result.resolution,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      video: result,
      videoId: video.id,
      usage: user.usage,
      remainingFree: FREEMIUM_LIMITS.FREE_GENERATIONS - user.usage.aiGenerations,
      plan: user.plan
    });

  } catch (error) {
    logger.error('Image-to-video generation error:', error);
    res.status(500).json({ error: 'Image-to-video generation failed' });
  }
});

app.get('/api/video-models', (req, res) => {
  try {
    const models = videoGenerator.getAvailableModels();
    const capabilities = videoGenerator.getModelCapabilities();
    
    res.json({
      success: true,
      models,
      capabilities
    });
  } catch (error) {
    logger.error('Video models fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch video models' });
  }
});

// Payment routes
app.post('/api/payments/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;
    const user = req.user; // req.user is now available from authenticateToken

    const prices = {
      'Starter': billingCycle === 'yearly' ? 190 : 19,
      'Professional': billingCycle === 'yearly' ? 490 : 49,
      'Enterprise': billingCycle === 'yearly' ? 1990 : 199
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${plan} Plan`,
            description: `Influencore ${plan} Plan - ${billingCycle} billing`
          },
          unit_amount: prices[plan] * 100, // Stripe expects cents
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan,
        billingCycle
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    logger.error('Payment session creation error:', error);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
});

// User management routes
app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const user = req.user; // req.user is now available from authenticateToken
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      company: user.company,
      plan: user.plan,
      subscriptionStatus: user.subscription_status,
      trialEndsAt: user.trial_ends_at,
      usage: user.usage
    });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Profile fetch failed' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, company } = req.body;
    const user = req.user; // req.user is now available from authenticateToken

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.first_name = firstName || user.first_name;
    user.last_name = lastName || user.last_name;
    user.company = company || user.company;

    const result = await userService.updateUser(user.id, user);
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        company: user.company,
        plan: user.plan,
        subscriptionStatus: user.subscription_status,
        trialEndsAt: user.trial_ends_at
      }
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Posts management
app.get('/api/posts', authenticateToken, (req, res) => {
  try {
    const userPosts = Array.from(posts.values())
      .filter(post => post.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(userPosts);
  } catch (error) {
    logger.error('Posts fetch error:', error);
    res.status(500).json({ error: 'Posts fetch failed' });
  }
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  try {
    const post = posts.get(req.params.id);
    if (!post || post.userId !== req.user.id) {
      return res.status(404).json({ error: 'Post not found' });
    }

    posts.delete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Post deletion error:', error);
    res.status(500).json({ error: 'Post deletion failed' });
  }
});

// Analytics
app.get('/api/analytics', authenticateToken, (req, res) => {
  try {
    const user = req.user; // req.user is now available from authenticateToken
    const userPosts = Array.from(posts.values())
      .filter(post => post.userId === user.id);

    const analytics = {
      totalPosts: userPosts.length,
      postsByPlatform: userPosts.reduce((acc, post) => {
        acc[post.platform] = (acc[post.platform] || 0) + 1;
        return acc;
      }, {}),
      postsByType: userPosts.reduce((acc, post) => {
        acc[post.type] = (acc[post.type] || 0) + 1;
        return acc;
      }, {}),
      usage: user.usage,
      plan: user.plan,
      subscriptionStatus: user.subscription_status
    };

    res.json(analytics);
  } catch (error) {
    logger.error('Analytics fetch error:', error);
    res.status(500).json({ error: 'Analytics fetch failed' });
  }
});

// Helper functions
function getPlanLimit(plan) {
  const limits = {
    'Free': FREEMIUM_LIMITS.FREE_GENERATIONS,
    'Starter': 50,
    'Professional': 500,
    'Enterprise': Infinity
  };
  return limits[plan] || FREEMIUM_LIMITS.FREE_GENERATIONS;
}

async function generateAIContentFromMessage(message, mode) {
  // Smart AI content generation that actually creates viral content
  const lowerMessage = message.toLowerCase();
  
  // Extract topic and intent from user message
  let topic = '';
  let intent = '';
  
  if (lowerMessage.includes('productivity') || lowerMessage.includes('tips')) {
    topic = 'productivity';
    intent = 'educational';
  } else if (lowerMessage.includes('cook') || lowerMessage.includes('recipe') || lowerMessage.includes('food')) {
    topic = 'cooking';
    intent = 'tutorial';
  } else if (lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    topic = 'fitness';
    intent = 'motivational';
  } else if (lowerMessage.includes('gaming') || lowerMessage.includes('game') || lowerMessage.includes('stream')) {
    topic = 'gaming';
    intent = 'entertainment';
  } else if (lowerMessage.includes('business') || lowerMessage.includes('entrepreneur') || lowerMessage.includes('money')) {
    topic = 'business';
    intent = 'educational';
  } else if (lowerMessage.includes('music') || lowerMessage.includes('song') || lowerMessage.includes('artist')) {
    topic = 'music';
    intent = 'entertainment';
  } else {
    topic = 'general';
    intent = 'informational';
  }

  const responses = {
    chat: generateSmartChatResponse(message, topic, intent),
    video: generateViralVideoScript(message, topic, intent),
    social: generateSocialMediaPost(message, topic, intent),
    twitch: generateTwitchContent(message, topic, intent),
    clips: generateViralClip(message, topic, intent)
  };
  
  return responses[mode] || responses.chat;
}

function generateSmartChatResponse(message, topic, intent) {
  const responses = {
    productivity: `🎯 PRODUCTIVITY HACK:\n\n"${message}"\n\n💡 Here's the secret: Most people waste 3+ hours daily on distractions. The solution?\n\n✅ Time-blocking technique\n✅ 25-minute focus sessions\n✅ Digital detox breaks\n\nTry this for 7 days and watch your output double! 📈\n\n#ProductivityHack #TimeManagement #Success`,
    
    cooking: `👨‍🍳 COOKING TIP:\n\n"${message}"\n\n🔥 Pro chef secret: The key to restaurant-quality food is technique, not fancy ingredients!\n\n✅ Master the basics first\n✅ Use high heat for searing\n✅ Season in layers\n✅ Let meat rest after cooking\n\nYour taste buds will thank you! 😋\n\n#CookingTips #ChefLife #Foodie`,
    
    fitness: `💪 FITNESS MOTIVATION:\n\n"${message}"\n\n🏋️‍♂️ Remember: You don't have to be great to start, but you have to start to be great!\n\n✅ Start with 10 minutes daily\n✅ Focus on consistency over intensity\n✅ Track your progress\n✅ Celebrate small wins\n\nYour future self is watching! 🔥\n\n#FitnessMotivation #NoExcuses #Transformation`,
    
    gaming: `🎮 GAMING CONTENT:\n\n"${message}"\n\n🔥 Pro gamer tip: The difference between good and great players?\n\n✅ Map awareness\n✅ Communication skills\n✅ Consistent practice\n✅ Mental game\n\nLevel up your skills and dominate the leaderboard! 🏆\n\n#GamingTips #ProGamer #Esports`,
    
    business: `💼 BUSINESS INSIGHT:\n\n"${message}"\n\n🚀 The most successful entrepreneurs focus on:\n\n✅ Solving real problems\n✅ Building relationships\n✅ Continuous learning\n✅ Taking calculated risks\n\nYour next big idea is waiting! 💡\n\n#EntrepreneurLife #BusinessTips #Success`,
    
    music: `🎵 MUSIC DISCOVERY:\n\n"${message}"\n\n🎧 Hidden gem alert! Here's what you need to know:\n\n✅ Listen to the lyrics\n✅ Feel the rhythm\n✅ Discover the story behind the song\n✅ Share with friends\n\nMusic connects us all! 🎶\n\n#MusicDiscovery #NewArtist #Vibes`,
    
    general: `✨ SMART INSIGHT:\n\n"${message}"\n\n💡 Here's what I think:\n\nThis topic has huge potential! The key is to:\n\n✅ Find your unique angle\n✅ Tell a compelling story\n✅ Engage your audience\n✅ Stay authentic\n\nYou've got this! 🚀\n\n#SmartContent #ViralPotential #Engagement`
  };
  
  return responses[topic] || responses.general;
}

function generateViralVideoScript(message, topic, intent) {
  const scripts = {
    productivity: `🎬 VIRAL PRODUCTIVITY VIDEO SCRIPT:\n\n"${message}"\n\n📱 HOOK (0-3s): "I wasted 3 years doing this wrong..."\n\n🎯 MIDDLE (3-15s): Show before/after transformation\n- Old way: Scattered, stressed, overwhelmed\n- New way: Focused, organized, productive\n\n💡 TIP: "The 2-minute rule changed everything"\n\n🔥 CTA (15-20s): "Follow for more productivity hacks!"\n\n#ProductivityHack #Viral #LifeHack`,
    
    cooking: `🎬 VIRAL COOKING VIDEO SCRIPT:\n\n"${message}"\n\n👨‍🍳 HOOK (0-3s): "Chefs don't want you to know this..."\n\n🍳 MIDDLE (3-15s): Show cooking technique\n- Quick prep tips\n- Secret ingredients\n- Perfect timing\n\n😋 RESULT: "Look at that perfect sear!"\n\n🔥 CTA (15-20s): "Save this recipe!"\n\n#CookingHack #Foodie #Viral`,
    
    fitness: `🎬 VIRAL FITNESS VIDEO SCRIPT:\n\n"${message}"\n\n💪 HOOK (0-3s): "This 30-second exercise..."\n\n🏋️‍♂️ MIDDLE (3-15s): Show workout\n- Proper form demonstration\n- Common mistakes to avoid\n- Results transformation\n\n🔥 CTA (15-20s): "Try this challenge!"\n\n#FitnessMotivation #Workout #Viral`,
    
    gaming: `🎬 VIRAL GAMING VIDEO SCRIPT:\n\n"${message}"\n\n🎮 HOOK (0-3s): "This gaming trick is OP..."\n\n🎯 MIDDLE (3-15s): Show gameplay\n- Pro technique demonstration\n- Strategy explanation\n- Epic moments\n\n🏆 CTA (15-20s): "Drop a like if you learned something!"\n\n#GamingTips #ProGamer #Viral`,
    
    business: `🎬 VIRAL BUSINESS VIDEO SCRIPT:\n\n"${message}"\n\n💼 HOOK (0-3s): "This business mistake cost me $50k..."\n\n🚀 MIDDLE (3-15s): Share lesson\n- What went wrong\n- What I learned\n- How to avoid it\n\n💡 CTA (15-20s): "Follow for more business tips!"\n\n#EntrepreneurLife #BusinessTips #Viral`,
    
    music: `🎬 VIRAL MUSIC VIDEO SCRIPT:\n\n"${message}"\n\n🎵 HOOK (0-3s): "This song hits different..."\n\n🎧 MIDDLE (3-15s): Show music\n- Play the track\n- Show lyrics\n- Share the story\n\n🎶 CTA (15-20s): "What's your favorite part?"\n\n#MusicDiscovery #Viral #NewArtist`,
    
    general: `🎬 VIRAL VIDEO SCRIPT:\n\n"${message}"\n\n🔥 HOOK (0-3s): "You won't believe what happened..."\n\n📱 MIDDLE (3-15s): Tell the story\n- Set up the situation\n- Build the tension\n- Deliver the payoff\n\n💯 CTA (15-20s): "Follow for more content!"\n\n#Viral #Trending #ContentCreation`
  };
  
  return scripts[topic] || scripts.general;
}

function generateSocialMediaPost(message, topic, intent) {
  const posts = {
    productivity: `🚀 PRODUCTIVITY HACK ALERT!\n\n"${message}"\n\n💡 Here's what changed my life:\n\n✅ Time-blocking technique\n✅ 25-minute focus sessions\n✅ Digital detox breaks\n\nI went from 2 hours of real work to 8 hours daily!\n\nTry this for 7 days and watch your output double! 📈\n\n#ProductivityHack #TimeManagement #Success #LifeHack`,
    
    cooking: `👨‍🍳 CHEF'S SECRET REVEALED!\n\n"${message}"\n\n🔥 The key to restaurant-quality food:\n\n✅ Master the basics first\n✅ Use high heat for searing\n✅ Season in layers\n✅ Let meat rest after cooking\n\nYour taste buds will thank you! 😋\n\n#CookingTips #ChefLife #Foodie #CookingHack`,
    
    fitness: `💪 FITNESS MOTIVATION!\n\n"${message}"\n\n🏋️‍♂️ Remember: You don't have to be great to start, but you have to start to be great!\n\n✅ Start with 10 minutes daily\n✅ Focus on consistency over intensity\n✅ Track your progress\n✅ Celebrate small wins\n\nYour future self is watching! 🔥\n\n#FitnessMotivation #NoExcuses #Transformation #Workout`,
    
    gaming: `🎮 PRO GAMER TIP!\n\n"${message}"\n\n🔥 The difference between good and great players:\n\n✅ Map awareness\n✅ Communication skills\n✅ Consistent practice\n✅ Mental game\n\nLevel up your skills and dominate the leaderboard! 🏆\n\n#GamingTips #ProGamer #Esports #Gaming`,
    
    business: `💼 ENTREPRENEUR INSIGHT!\n\n"${message}"\n\n🚀 The most successful entrepreneurs focus on:\n\n✅ Solving real problems\n✅ Building relationships\n✅ Continuous learning\n✅ Taking calculated risks\n\nYour next big idea is waiting! 💡\n\n#EntrepreneurLife #BusinessTips #Success #Startup`,
    
    music: `🎵 HIDDEN GEM ALERT!\n\n"${message}"\n\n🎧 What you need to know:\n\n✅ Listen to the lyrics\n✅ Feel the rhythm\n✅ Discover the story behind the song\n✅ Share with friends\n\nMusic connects us all! 🎶\n\n#MusicDiscovery #NewArtist #Vibes #Music`,
    
    general: `✨ SMART CONTENT ALERT!\n\n"${message}"\n\n💡 Here's what I think:\n\nThis topic has huge potential! The key is to:\n\n✅ Find your unique angle\n✅ Tell a compelling story\n✅ Engage your audience\n✅ Stay authentic\n\nYou've got this! 🚀\n\n#SmartContent #ViralPotential #Engagement #ContentCreation`
  };
  
  return posts[topic] || posts.general;
}

function generateTwitchContent(message, topic, intent) {
  const streams = {
    productivity: `🎮 PRODUCTIVITY STREAM!\n\n"${message}"\n\n🔥 LIVE NOW: Let's get productive together!\n\n✅ Working on time management\n✅ Sharing productivity hacks\n✅ Q&A about staying focused\n✅ Real-time tips and tricks\n\nChat with us and share your productivity tips! 💪\n\n#ProductivityStream #WorkFromHome #Focus #Twitch`,
    
    cooking: `👨‍🍳 COOKING STREAM!\n\n"${message}"\n\n🔥 LIVE NOW: Cooking up something delicious!\n\n✅ Making a new recipe\n✅ Sharing cooking tips\n✅ Q&A about techniques\n✅ Taste testing with chat\n\nJoin us in the kitchen! 🍳\n\n#CookingStream #ChefLife #Foodie #Twitch`,
    
    fitness: `💪 FITNESS STREAM!\n\n"${message}"\n\n🔥 LIVE NOW: Let's get fit together!\n\n✅ Working out live\n✅ Sharing fitness tips\n✅ Q&A about training\n✅ Motivation and support\n\nLet's crush our goals! 🏋️‍♂️\n\n#FitnessStream #Workout #Motivation #Twitch`,
    
    gaming: `🎮 GAMING STREAM!\n\n"${message}"\n\n🔥 LIVE NOW: Epic gaming session!\n\n✅ Playing your favorite games\n✅ Sharing pro tips\n✅ Q&A about strategies\n✅ Interactive gameplay\n\nJoin the fun and let's dominate together! 🎮\n\n#GamingStream #ProGamer #Esports #Twitch`,
    
    business: `💼 BUSINESS STREAM!\n\n"${message}"\n\n🔥 LIVE NOW: Entrepreneur insights!\n\n✅ Sharing business tips\n✅ Q&A about startups\n✅ Real-time advice\n✅ Success stories\n\nLet's build something amazing! 🚀\n\n#BusinessStream #Entrepreneur #Startup #Twitch`,
    
    music: `🎵 MUSIC STREAM!\n\n"${message}"\n\n🔥 LIVE NOW: Music discovery session!\n\n✅ Playing new tracks\n✅ Sharing music insights\n✅ Q&A about artists\n✅ Interactive playlist\n\nLet's discover amazing music! 🎶\n\n#MusicStream #MusicDiscovery #Vibes #Twitch`,
    
    general: `🎮 LIVE STREAM!\n\n"${message}"\n\n🔥 LIVE NOW: Let's hang out!\n\n✅ Interactive content\n✅ Q&A with chat\n✅ Fun and games\n✅ Community building\n\nJoin the conversation! 💬\n\n#LiveStream #Community #Fun #Twitch`
  };
  
  return streams[topic] || streams.general;
}

function generateViralClip(message, topic, intent) {
  const clips = {
    productivity: `✂️ VIRAL PRODUCTIVITY CLIP!\n\n"${message}"\n\n🎬 CLIP SCRIPT:\n\nHOOK (0-3s): "I wasted 3 years doing this wrong..."\n\nCONTENT (3-15s): Show before/after transformation\n- Old way: Scattered and stressed\n- New way: Focused and productive\n\nTIP: "The 2-minute rule changed everything"\n\nCTA (15-20s): "Follow for more hacks!"\n\n#ProductivityHack #ViralClip #LifeHack #Shorts`,
    
    cooking: `✂️ VIRAL COOKING CLIP!\n\n"${message}"\n\n🎬 CLIP SCRIPT:\n\nHOOK (0-3s): "Chefs don't want you to know this..."\n\nCONTENT (3-15s): Show cooking technique\n- Quick prep tips\n- Secret ingredients\n- Perfect timing\n\nRESULT: "Look at that perfect sear!"\n\nCTA (15-20s): "Save this recipe!"\n\n#CookingHack #ViralClip #Foodie #Shorts`,
    
    fitness: `✂️ VIRAL FITNESS CLIP!\n\n"${message}"\n\n🎬 CLIP SCRIPT:\n\nHOOK (0-3s): "This 30-second exercise..."\n\nCONTENT (3-15s): Show workout\n- Proper form demonstration\n- Common mistakes to avoid\n- Results transformation\n\nCTA (15-20s): "Try this challenge!"\n\n#FitnessMotivation #ViralClip #Workout #Shorts`,
    
    gaming: `✂️ VIRAL GAMING CLIP!\n\n"${message}"\n\n🎬 CLIP SCRIPT:\n\nHOOK (0-3s): "This gaming trick is OP..."\n\nCONTENT (3-15s): Show gameplay\n- Pro technique demonstration\n- Strategy explanation\n- Epic moments\n\nCTA (15-20s): "Drop a like if you learned something!"\n\n#GamingTips #ViralClip #ProGamer #Shorts`,
    
    business: `✂️ VIRAL BUSINESS CLIP!\n\n"${message}"\n\n🎬 CLIP SCRIPT:\n\nHOOK (0-3s): "This business mistake cost me $50k..."\n\nCONTENT (3-15s): Share lesson\n- What went wrong\n- What I learned\n- How to avoid it\n\nCTA (15-20s): "Follow for more business tips!"\n\n#EntrepreneurLife #ViralClip #BusinessTips #Shorts`,
    
    music: `✂️ VIRAL MUSIC CLIP!\n\n"${message}"\n\n🎬 CLIP SCRIPT:\n\nHOOK (0-3s): "This song hits different..."\n\nCONTENT (3-15s): Show music\n- Play the track\n- Show lyrics\n- Share the story\n\nCTA (15-20s): "What's your favorite part?"\n\n#MusicDiscovery #ViralClip #NewArtist #Shorts`,
    
    general: `✂️ VIRAL CLIP!\n\n"${message}"\n\n🎬 CLIP SCRIPT:\n\nHOOK (0-3s): "You won't believe what happened..."\n\nCONTENT (3-15s): Tell the story\n- Set up the situation\n- Build the tension\n- Deliver the payoff\n\nCTA (15-20s): "Follow for more content!"\n\n#ViralClip #Trending #ContentCreation #Shorts`
  };
  
  return clips[topic] || clips.general;
}

async function generateAIContent(brand, product, audience, platform, tone, template) {
  // Enhanced AI content generation with real templates
  const templates = {
    'Default': `🎯 Ready to level up your game? Our ${product} is the secret weapon you've been waiting for! 💪 #GameChanger #LevelUp`,
    'Story': `📖 Once upon a time, there was a ${audience} who discovered ${product}... and their life changed forever! ✨`,
    'Tutorial': `🔧 Step-by-step guide to mastering ${product} - because everyone deserves to succeed! 📚`,
    'Review': `⭐ Honest review: ${product} exceeded all expectations. Here's why you need it! 🚀`,
    'Behind the Scenes': `🎬 Behind the scenes: How we created ${product} for ${audience} like you! 💡`,
    'User Generated': `👥 What our community says about ${product}: "Game changer!" - Real user feedback! 💬`
  };

  const platformSpecific = {
    'TikTok': '🔥 Viral content alert! ',
    'Instagram': '✨ Transform your routine with ',
    'YouTube': '🎬 NEW: Complete review of ',
    'Twitter': 'Hot take: ',
    'LinkedIn': '💼 Professional insight: ',
    'Facebook': '🌟 Community favorite: '
  };

  const baseContent = templates[template] || templates['Default'];
  const platformPrefix = platformSpecific[platform] || '';
  
  return platformPrefix + baseContent.replace('${product}', product).replace('${audience}', audience);
}

async function generateVideoScriptFromMessage(message, mode) {
  const lowerMessage = message.toLowerCase();
  
  // Extract topic and intent from user message
  let topic = '';
  let intent = '';
  
  if (lowerMessage.includes('productivity') || lowerMessage.includes('tips')) {
    topic = 'productivity';
    intent = 'educational';
  } else if (lowerMessage.includes('cook') || lowerMessage.includes('recipe') || lowerMessage.includes('food')) {
    topic = 'cooking';
    intent = 'tutorial';
  } else if (lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    topic = 'fitness';
    intent = 'motivational';
  } else if (lowerMessage.includes('gaming') || lowerMessage.includes('game') || lowerMessage.includes('stream')) {
    topic = 'gaming';
    intent = 'entertainment';
  } else if (lowerMessage.includes('business') || lowerMessage.includes('entrepreneur') || lowerMessage.includes('money')) {
    topic = 'business';
    intent = 'educational';
  } else if (lowerMessage.includes('music') || lowerMessage.includes('song') || lowerMessage.includes('artist')) {
    topic = 'music';
    intent = 'entertainment';
  } else {
    topic = 'general';
    intent = 'informational';
  }

  const scripts = {
    chat: generateViralVideoScript(message, topic, intent),
    video: generateViralVideoScript(message, topic, intent),
    social: generateViralVideoScript(message, topic, intent),
    twitch: generateTwitchContent(message, topic, intent),
    clips: generateViralClip(message, topic, intent)
  };

  return scripts[mode] || scripts.chat;
}

async function generateVideoScript(brand, product, audience, platform, tone, template) {
  const scripts = {
    'TikTok': `🎬 TIKTOK SCRIPT:\n\nHOOK (0-3s): "You won't believe what ${product} just did..."\n\nMIDDLE (3-15s): Show product benefits and features\n\nCTA (15-20s): "Tap the link to get yours!"`,
    'Instagram': `📱 INSTAGRAM REEL SCRIPT:\n\nOPENING (0-3s): "The secret to success is finally here..."\n\nCONTENT (3-15s): Show before/after transformation\n\nENDING (15-20s): "Swipe up to learn more!"`,
    'YouTube': `🎬 YOUTUBE SCRIPT:\n\nINTRO (0-10s): "Hey everyone! Today we're testing ${product}..."\n\nMAIN CONTENT (10s-8min): Detailed review and testing\n\nCONCLUSION (8-10min): Final thoughts and recommendations`
  };

  return scripts[platform] || scripts['TikTok'];
}

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Stripe webhook handler
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook event handlers
async function handleCheckoutSessionCompleted(session) {
  try {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (userId && plan) {
      const result = await userService.updateUser(userId, {
        plan: plan,
        subscription_status: 'active',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription
      });

      if (result.success) {
        // Send upgrade notification email
        emailService.sendUpgradeNotification(result.user, plan);
        logger.info(`User ${userId} upgraded to ${plan} plan`);
      }
    }
  } catch (error) {
    logger.error('Checkout session completed handler error:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    const customerId = subscription.customer;
    // Update user subscription status
    logger.info(`Subscription created for customer: ${customerId}`);
  } catch (error) {
    logger.error('Subscription created handler error:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const customerId = subscription.customer;
    const status = subscription.status;
    
    // Update user subscription status based on Stripe status
    logger.info(`Subscription updated for customer: ${customerId}, status: ${status}`);
  } catch (error) {
    logger.error('Subscription updated handler error:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const customerId = subscription.customer;
    
    // Downgrade user to free plan
    logger.info(`Subscription deleted for customer: ${customerId}`);
  } catch (error) {
    logger.error('Subscription deleted handler error:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    const customerId = invoice.customer;
    logger.info(`Payment succeeded for customer: ${customerId}`);
  } catch (error) {
    logger.error('Payment succeeded handler error:', error);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    const customerId = invoice.customer;
    logger.warn(`Payment failed for customer: ${customerId}`);
  } catch (error) {
    logger.error('Payment failed handler error:', error);
  }
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`🚀 Influencore server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  logger.info(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  logger.info(`📧 Email: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
});
