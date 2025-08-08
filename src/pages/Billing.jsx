import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Billing() {
  const [userSession, setUserSession] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const userData = JSON.parse(session);
      setUserSession(userData.user);
      
      // Generate mock billing history
      const mockHistory = [
        {
          id: 'inv_001',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 49.00,
          status: 'paid',
          description: 'Professional Plan - Monthly'
        },
        {
          id: 'inv_002',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 49.00,
          status: 'paid',
          description: 'Professional Plan - Monthly'
        },
        {
          id: 'inv_003',
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 49.00,
          status: 'paid',
          description: 'Professional Plan - Monthly'
        }
      ];
      setBillingHistory(mockHistory);
    }
    setIsLoading(false);
  };

  const handleUpgrade = () => {
    window.open('/pricing', '_blank');
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      // In a real app, this would call the API to cancel subscription
      alert('Subscription cancellation request submitted. You will receive a confirmation email.');
    }
  };

  const getPlanFeatures = (plan) => {
    const features = {
      'Starter': ['50 AI generations/month', '3 platforms', 'Basic templates', 'Email support'],
      'Professional': ['500 AI generations/month', 'All 6 platforms', 'Advanced templates', 'Priority support', 'API access'],
      'Enterprise': ['Unlimited generations', 'All platforms', 'Custom AI training', 'Dedicated support', 'White-label']
    };
    return features[plan] || [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please sign in to view billing</h2>
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const isTrial = userSession.subscriptionStatus === 'trial';
  const trialEndDate = new Date(userSession.trialEndsAt);
  const daysLeft = Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-gray-400">Manage your subscription and billing information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
              
              {isTrial && (
                <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg mb-4">
                  <strong>Trial Period:</strong> {daysLeft} days remaining in your free trial
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{userSession.plan} Plan</h3>
                  <p className="text-gray-400">
                    {isTrial ? 'Free Trial' : '$49/month'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isTrial ? 'bg-yellow-600' : 'bg-green-600'
                  }`}>
                    {isTrial ? 'Trial' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">Plan Features:</h4>
                <ul className="space-y-1">
                  {getPlanFeatures(userSession.plan).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-300">
                      <span className="text-green-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upgrade Plan
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Billing History</h2>
              <div className="space-y-4">
                {billingHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold">{invoice.description}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${invoice.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        invoice.status === 'paid' ? 'bg-green-600' : 'bg-yellow-600'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-sm">💳</span>
                    </div>
                    <div>
                      <p className="font-semibold">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-400">Expires 12/25</p>
                    </div>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Edit
                  </button>
                </div>
                <button className="w-full px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                  + Add Payment Method
                </button>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Usage This Month</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>AI Generations</span>
                    <span>127 / 500</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Platforms Connected</span>
                    <span>4 / 6</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 