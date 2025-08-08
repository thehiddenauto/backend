import React, { useState, useEffect } from 'react';

export default function SocialConnector() {
  const [connections, setConnections] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'Share photos and stories',
      scopes: ['basic', 'content_publish', 'comments_read']
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-gradient-to-r from-black to-gray-800',
      description: 'Create and share short videos',
      scopes: ['user.info.basic', 'video.upload', 'video.publish']
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      color: 'bg-gradient-to-r from-red-500 to-red-700',
      description: 'Upload and manage videos',
      scopes: ['youtube.upload', 'youtube.readonly', 'youtube.force-ssl']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-gradient-to-r from-blue-400 to-blue-600',
      description: 'Share tweets and threads',
      scopes: ['tweet.read', 'tweet.write', 'users.read']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-gradient-to-r from-blue-600 to-blue-800',
      description: 'Professional networking',
      scopes: ['r_liteprofile', 'w_member_social', 'r_emailaddress']
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'bg-gradient-to-r from-blue-600 to-blue-800',
      description: 'Share posts and stories',
      scopes: ['public_profile', 'pages_manage_posts', 'pages_read_engagement']
    }
  ];

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = () => {
    const saved = localStorage.getItem('socialConnections');
    if (saved) {
      setConnections(JSON.parse(saved));
    }
  };

  const saveConnections = (newConnections) => {
    localStorage.setItem('socialConnections', JSON.stringify(newConnections));
    setConnections(newConnections);
  };

  const simulateOAuthFlow = async (platform) => {
    setIsConnecting(true);
    setSelectedPlatform(platform);

    try {
      // Simulate realistic OAuth flow with steps
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Connecting to ${platform.name}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Authenticating with ${platform.name}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Fetching user profile from ${platform.name}...`);
      
      // Generate realistic mock data
      const mockUsernames = {
        instagram: ['creative_life', 'lifestyle_blogger', 'content_creator'],
        tiktok: ['viral_creator', 'trending_now', 'content_maker'],
        youtube: ['tech_reviewer', 'lifestyle_channel', 'product_tester'],
        twitter: ['social_expert', 'trend_analyst', 'content_strategist'],
        linkedin: ['professional_networker', 'business_expert', 'industry_leader'],
        facebook: ['social_media_expert', 'community_builder', 'content_creator']
      };
      
      const mockDisplayNames = {
        instagram: ['Creative Life', 'Lifestyle Blogger', 'Content Creator'],
        tiktok: ['Viral Creator', 'Trending Now', 'Content Maker'],
        youtube: ['Tech Reviewer', 'Lifestyle Channel', 'Product Tester'],
        twitter: ['Social Expert', 'Trend Analyst', 'Content Strategist'],
        linkedin: ['Professional Networker', 'Business Expert', 'Industry Leader'],
        facebook: ['Social Media Expert', 'Community Builder', 'Content Creator']
      };
      
      const username = mockUsernames[platform.id]?.[Math.floor(Math.random() * 3)] || `user_${platform.id}`;
      const displayName = mockDisplayNames[platform.id]?.[Math.floor(Math.random() * 3)] || `User ${platform.name}`;
      const followers = Math.floor(Math.random() * 50000) + 1000;
      const following = Math.floor(Math.random() * 500) + 50;
      
      // Simulate successful connection
      const mockConnection = {
        id: platform.id,
        name: platform.name,
        connectedAt: new Date().toISOString(),
        accessToken: `mock_token_${platform.id}_${Date.now()}`,
        refreshToken: `mock_refresh_${platform.id}_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        scopes: platform.scopes,
        profile: {
          id: `user_${platform.id}_${Date.now()}`,
          username: username,
          displayName: displayName,
          avatar: `https://via.placeholder.com/150/333/fff?text=${platform.icon}`,
          followers: followers,
          following: following,
          verified: Math.random() > 0.7, // 30% chance of being verified
          bio: `Professional content creator and ${platform.name} expert. Sharing insights and creating engaging content.`
        }
      };

      const newConnections = { ...connections, [platform.id]: mockConnection };
      saveConnections(newConnections);
      
      alert(`Successfully connected to ${platform.name}!`);
    } catch (error) {
      alert(`Failed to connect to ${platform.name}. Please try again.`);
    } finally {
      setIsConnecting(false);
      setSelectedPlatform(null);
    }
  };

  const disconnectPlatform = (platformId) => {
    if (window.confirm(`Are you sure you want to disconnect from ${platforms.find(p => p.id === platformId)?.name}?`)) {
      const newConnections = { ...connections };
      delete newConnections[platformId];
      saveConnections(newConnections);
    }
  };

  const refreshToken = async (platformId) => {
    const connection = connections[platformId];
    if (!connection) return;

    setIsConnecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedConnection = {
        ...connection,
        accessToken: `mock_token_${platformId}_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      
      const newConnections = { ...connections, [platformId]: updatedConnection };
      saveConnections(newConnections);
      
      alert('Token refreshed successfully!');
    } catch (error) {
      alert('Failed to refresh token');
    } finally {
      setIsConnecting(false);
    }
  };

  const testConnection = async (platformId) => {
    const connection = connections[platformId];
    if (!connection) return;

    setIsConnecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Connection to ${connection.name} is working!`);
    } catch (error) {
      alert(`Connection to ${connection.name} failed. Please reconnect.`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Social Media Connections</h2>
      
      {/* Connection Status */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Connection Status</h3>
            <p className="text-gray-400">
              {Object.keys(connections).length} of {platforms.length} platforms connected
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const allConnected = platforms.every(p => connections[p.id]);
                if (allConnected) {
                  alert('All platforms are already connected!');
                } else {
                  const unconnected = platforms.filter(p => !connections[p.id]);
                  alert(`Connect to: ${unconnected.map(p => p.name).join(', ')}`);
                }
              }}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📊 Connection Overview
            </button>
          </div>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map(platform => {
          const connection = connections[platform.id];
          const isConnecting = selectedPlatform?.id === platform.id;

          return (
            <div key={platform.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center text-2xl`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{platform.name}</h3>
                    <p className="text-sm text-gray-400">{platform.description}</p>
                  </div>
                </div>
                {connection && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-400">Connected</span>
                  </div>
                )}
              </div>

              {connection ? (
                <div className="space-y-3">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <img 
                        src={connection.profile.avatar} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{connection.profile.displayName}</p>
                        <p className="text-xs text-gray-400">@{connection.profile.username}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{connection.profile.followers.toLocaleString()} followers</span>
                      <span>{connection.profile.following.toLocaleString()} following</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => testConnection(platform.id)}
                      disabled={isConnecting}
                      className="w-full px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isConnecting ? 'Testing...' : '🧪 Test Connection'}
                    </button>
                    <button
                      onClick={() => refreshToken(platform.id)}
                      disabled={isConnecting}
                      className="w-full px-3 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      {isConnecting ? 'Refreshing...' : '🔄 Refresh Token'}
                    </button>
                    <button
                      onClick={() => disconnectPlatform(platform.id)}
                      className="w-full px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🚫 Disconnect
                    </button>
                  </div>

                  <div className="text-xs text-gray-400">
                    <p>Connected: {new Date(connection.connectedAt).toLocaleDateString()}</p>
                    <p>Expires: {new Date(connection.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">
                    <p className="mb-2">Required permissions:</p>
                    <ul className="space-y-1">
                      {platform.scopes.map(scope => (
                        <li key={scope} className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>{scope}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => simulateOAuthFlow(platform)}
                    disabled={isConnecting}
                    className={`w-full px-4 py-3 rounded-lg transition-colors disabled:opacity-50 ${
                      platform.color.replace('bg-gradient-to-r', 'bg-gradient-to-r')
                    } hover:opacity-90`}
                  >
                    {isConnecting ? 'Connecting...' : `Connect to ${platform.name}`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* API Testing Section */}
      {Object.keys(connections).length > 0 && (
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">API Testing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => {
                alert('Simulating post creation...\nThis would create a post on all connected platforms.');
              }}
              className="p-4 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              📝 Create Post
            </button>
            <button
              onClick={() => {
                alert('Simulating analytics fetch...\nThis would retrieve engagement data from all platforms.');
              }}
              className="p-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📊 Get Analytics
            </button>
            <button
              onClick={() => {
                alert('Simulating content scheduling...\nThis would schedule posts across all platforms.');
              }}
              className="p-4 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              ⏰ Schedule Content
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 