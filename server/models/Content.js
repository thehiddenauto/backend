import { DataTypes } from 'sequelize';
import sequelize from '../database.js';
import User from './User.js';

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'video', 'image', 'audio', 'script'),
    allowNull: false
  },
  platform: {
    type: DataTypes.ENUM('TikTok', 'Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook', 'Twitch', 'General'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'scheduled', 'archived'),
    defaultValue: 'draft'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {
      hashtags: [],
      mentions: [],
      links: [],
      duration: null,
      dimensions: null,
      fileSize: null,
      aiGenerated: true,
      prompt: '',
      model: 'influencore-ai',
      confidence: 0.95
    }
  },
  analytics: {
    type: DataTypes.JSONB,
    defaultValue: {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      engagement: 0,
      reach: 0,
      impressions: 0
    }
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  externalId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID from external platform (e.g., TikTok video ID)'
  },
  externalUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL to the published content on external platform'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['platform']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Associations
Content.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Content, { foreignKey: 'userId', as: 'contents' });

export default Content; 