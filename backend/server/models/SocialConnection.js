import { DataTypes } from 'sequelize';
import sequelize from '../database.js';
import User from './User.js';

const SocialConnection = sequelize.define('SocialConnection', {
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
  platform: {
    type: DataTypes.ENUM('TikTok', 'Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook', 'Twitch'),
    allowNull: false
  },
  platformUserId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  platformUsername: {
    type: DataTypes.STRING,
    allowNull: false
  },
  platformDisplayName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profileData: {
    type: DataTypes.JSONB,
    defaultValue: {
      followers: 0,
      following: 0,
      posts: 0,
      verified: false,
      bio: '',
      avatar: '',
      website: '',
      location: ''
    }
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {
      read: true,
      write: false,
      publish: false,
      schedule: false
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  errorCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['platform']
    },
    {
      fields: ['platformUserId']
    },
    {
      unique: true,
      fields: ['userId', 'platform']
    }
  ]
});

// Associations
SocialConnection.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SocialConnection, { foreignKey: 'userId', as: 'socialConnections' });

export default SocialConnection; 