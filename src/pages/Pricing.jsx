import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      features: [
        '2 AI content generations',
        '1 social media platform',
        'Basic templates',
        'Content library (10 posts)',
        'Community support'
      ],
      popular: false,
      cta: 'Get Started Free',
      highlight: 'Perfect for trying out'
    },
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? 19 : 190,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      features: [
        '50 AI content generations per month',
        '3 social media platforms',
        'Advanced templates',
        'Content library (100 posts)',
        'Email support',
        'Export to JSON'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      price: billingCycle === 'monthly' ? 49 : 490,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      features: [
        '500 AI content generations per month',
        'All 6 social media platforms',
        'Advanced templates & customization',
        'Unlimited content library',
        'Priority support',
        'API access',
        'Analytics dashboard',
        'Team collaboration (3 members)',
        'White-label options'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 199 : 1990,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      features: [
        'Unlimited AI content generations',
        'All social media platforms',
        'Custom AI model training',
        'Advanced analytics & reporting',
        'Dedicated account manager',
        'Custom integrations',
        'Team collaboration (unlimited)',
        'White-label solution',
        'SLA guarantee',
        'On-premise deployment'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const handleSubscribe = (planName) => {
    // In a real app, this would integrate with Stripe/PayPal
    if (planName === 'Enterprise') {
      window.open('mailto:sales@influencore.com?subject=Enterprise%20Inquiry', '_blank');
    } else {
      // Simulate payment flow
      const paymentUrl = `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substr(2, 9)}`;
      window.open(paymentUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">🎯 Influencore</Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              <Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link>
              <Link to="/pricing" className="text-blue-400 font-semibold">Pricing</Link>
              <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
              <Link to="/login" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Scale your social media presence with AI-powered content generation
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly
              <span className="ml-1 text-green-400">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-gray-800 rounded-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              } ${plan.name === 'Free' ? 'border-2 border-green-500/30' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {plan.name === 'Free' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {plan.highlight}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="mb-6">
                  {plan.name === 'Free' ? (
                    <span className="text-4xl font-bold text-green-400">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-400">/{plan.period}</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleSubscribe(plan.name)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.name === 'Free'
                      ? 'bg-green-600 hover:bg-green-700'
                      : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <span className="text-green-400 mr-3">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-300">Yes, you can cancel your subscription at any time. No long-term contracts required.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Do you offer a free plan?</h3>
              <p className="text-gray-300">Yes! We offer a free plan with 2 AI generations to try out our platform. No credit card required.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-300">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Is my data secure?</h3>
              <p className="text-gray-300">Absolutely. We use enterprise-grade encryption and are SOC 2 compliant. Your data is never shared with third parties.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to scale your social media presence?</h2>
          <p className="text-gray-300 mb-8">Join thousands of content creators who trust Influencore</p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
} 