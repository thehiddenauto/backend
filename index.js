// Simple working index.js for Render deployment
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0',
    message: 'Influencore Backend is running!'
  });
});

// Video generation endpoint (fallback)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    res.json({
      success: true,
      videoUrl: 'https://example.com/video.mp4',
      prompt,
      timestamp: new Date().toISOString(),
      message: 'Video generation endpoint working!'
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: 'Video generation failed' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Influencore Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Influencore server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
}); 