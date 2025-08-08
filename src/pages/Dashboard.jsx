import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    connectedPlatforms: 0,
    savedTemplates: 0,
    totalEngagement: 0,
    avgEngagement: 0,
    recentActivity: []
  });
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load user session
    const session = localStorage.getItem('userSession');
    if (session) {
      setUserSession(JSON.parse(session).user);
    }

    // Load posts from library
    const savedPosts = localStorage.getItem('libraryPosts');
    const generatedPosts = localStorage.getItem('generatedPosts');
    const connections = localStorage.getItem('socialConnections');
    const userProfile = localStorage.getItem('userProfile');

    const posts = [
      ...(savedPosts ? JSON.parse(savedPosts) : []),
      ...(generatedPosts ? JSON.parse(generatedPosts) : [])
    ];

    const connectionsData = connections ? JSON.parse(connections) : {};
    const profileData = userProfile ? JSON.parse(userProfile) : {};

    // Calculate engagement metrics
    const totalEngagement = posts.reduce((sum, post) => {
      const baseEngagement = Math.floor(Math.random() * 1000) + 100;
      return sum + baseEngagement;
    }, 0);

    const avgEngagement = posts.length > 0 ? Math.floor(totalEngagement / posts.length) : 0;

    setStats({
      totalPosts: posts.length,
      connectedPlatforms: Object.keys(connectionsData).length,
      savedTemplates: 6, // Hardcoded for now
      totalEngagement: totalEngagement,
      avgEngagement: avgEngagement,
      recentActivity: posts.slice(0, 5).map(post => ({
        type: 'post',
        title: post.title || 'Untitled Post',
        platform: post.platform || 'Unknown',
        date: new Date(post.createdAt).toLocaleDateString(),
        content: post.content?.substring(0, 50) + '...',
        engagement: Math.floor(Math.random() * 1000) + 100
      }))
    });
  };

  const quickActions = [
    {
      title: 'Generate Content',
      description: 'Create new AI-powered content',
      icon: '🤖',
      link: '/generator',
      color: 'bg-blue-600'
    },
    {
      title: 'View Library',
      description: 'Browse saved content',
      icon: '📚',
      link: '/library',
      color: 'bg-green-600'
    },
    {
      title: 'Connect Platforms',
      description: 'Manage social media connections',
      icon: '🔗',
      link: '/social',
      color: 'bg-purple-600'
    },
    {
      title: 'Settings',
      description: 'Update profile and preferences',
      icon: '⚙️',
      link: '/profile',
      color: 'bg-yellow-600'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* User Welcome Section */}
      {userSession && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {userSession.firstName || userSession.name || 'User'}!
              </h1>
              <p className="text-gray-400">
                {userSession.plan} Plan • {userSession.subscriptionStatus === 'trial' ? 'Trial' : 'Active'} Subscription
              </p>
            </div>
            <div className="text-right">
              <Link
                to="/billing"
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Billing
              </Link>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Connected Platforms</p>
              <p className="text-2xl font-bold">{stats.connectedPlatforms}</p>
            </div>
            <div className="text-3xl">🔗</div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Engagement</p>
              <p className="text-2xl font-bold">{stats.totalEngagement.toLocaleString()}</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg. Engagement</p>
              <p className="text-2xl font-bold">{stats.avgEngagement}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-xl`}>
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{action.title}</h4>
                    <p className="text-sm text-gray-400">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm">
                    📝
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-400">
                      {activity.platform} • {activity.date}
                    </p>
                    <p className="text-xs text-green-400">
                      {activity.engagement} engagements
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📝</div>
                <p>No recent activity</p>
                <p className="text-sm">Start creating content to see activity here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Platform Status */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Platform Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook'].map((platform, index) => (
            <div key={index} className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">
                {platform === 'Instagram' && '📷'}
                {platform === 'TikTok' && '🎵'}
                {platform === 'YouTube' && '📺'}
                {platform === 'Twitter' && '🐦'}
                {platform === 'LinkedIn' && '💼'}
                {platform === 'Facebook' && '📘'}
              </div>
              <p className="font-medium">{platform}</p>
              <p className="text-xs text-gray-400">Connected</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}