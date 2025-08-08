import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const features = [
    {
      title: 'AI Video Clipping',
      description: 'Turn any long video into viral shorts with AI-powered clipping',
      icon: '✂️',
      highlight: '10x faster than manual editing'
    },
    {
      title: 'AI Content Generation',
      description: 'Generate engaging social media posts, captions, and scripts',
      icon: '🤖',
      highlight: 'AI-powered content creation'
    },
    {
      title: 'Multi-Platform Publishing',
      description: 'Automatically publish to TikTok, Instagram, YouTube, and more',
      icon: '📱',
      highlight: 'One-click publishing'
    },
    {
      title: 'AI B-Roll Generation',
      description: 'Generate relevant B-roll footage to enhance your videos',
      icon: '🎬',
      highlight: 'AI-generated footage'
    },
    {
      title: 'Brand Templates',
      description: 'Create and apply consistent brand templates across all content',
      icon: '🎨',
      highlight: 'Brand consistency'
    },
    {
      title: 'Analytics & Insights',
      description: 'Track performance and optimize your content strategy',
      icon: '📊',
      highlight: 'Data-driven insights'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Content Creator',
      company: '@sarahcreates',
      content: 'Influencore helped me scale from 10K to 100K followers in just 3 months!',
      avatar: '👩‍💼',
      followers: '100K+'
    },
    {
      name: 'Mike Chen',
      role: 'Marketing Director',
      company: 'TechFlow Inc.',
      content: 'Our team saves 20+ hours per week on content creation. The AI suggestions are incredibly accurate.',
      avatar: '👨‍💼',
      followers: '50K+'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Influencer',
      company: '@emma_lifestyle',
      content: 'The video clipping feature is game-changing. My engagement rates have doubled!',
      avatar: '👩‍🎨',
      followers: '200K+'
    }
  ];

  const stats = [
    { label: 'Video Creators', value: '12M+', icon: '👥' },
    { label: 'Videos Processed', value: '500K+', icon: '🎬' },
    { label: 'Platforms Supported', value: '8', icon: '📱' },
    { label: 'Avg. Engagement Increase', value: '300%', icon: '📈' }
  ];

  const handleVideoSubmit = (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('Video processing started! Check your dashboard for results.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">🎯 Influencore</Link>
            <div className="flex items-center space-x-6">
              <Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link>
              <Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link>
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
          <h1 className="text-6xl font-bold mb-6">
            #1 AI VIDEO CLIPPING TOOL
          </h1>
          <h2 className="text-4xl font-bold mb-6 text-blue-400">
            1 long video, 10 viral clips. Create 10x faster.
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Influencore turns long videos into shorts, and publishes them to all social platforms in one click.
          </p>
        </div>

        {/* Video Upload Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-center">Drop a video link</h3>
            <form onSubmit={handleVideoSubmit} className="space-y-4">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full p-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-white placeholder-gray-400"
              />
              <div className="text-sm text-gray-400 text-center">
                For Pro plan, we support videos from: YouTube, Google Drive, Vimeo, Zoom, Rumble, Twitch, Facebook, LinkedIn, Twitter, Loom, Riverside, StreamYard and more.
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isProcessing || !videoUrl.trim()}
                  className="px-8 py-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {isProcessing ? 'Processing...' : 'Get Free Clips'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <Link to="/generator" className="text-blue-400 hover:text-blue-300 underline">
                Or try our AI Content Generator →
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-blue-400">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">AI that understands every pixel of your video</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-300 mb-3">{feature.description}</p>
                <span className="text-blue-400 text-sm font-semibold">{feature.highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Used by 12M+ creators and businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.company}</div>
                    <div className="text-xs text-blue-400">{testimonial.followers} followers</div>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to scale your video content?</h2>
          <p className="text-gray-300 mb-8">Join millions of creators who trust Influencore</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-green-600 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              Start Free (2 Generations)
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-lg font-semibold"
            >
              View Plans
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required • 2 free generations • Upgrade anytime
          </p>
        </div>
      </div>
    </div>
  );
}