import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Generator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState('Free');
  const [remainingFree, setRemainingFree] = useState(2);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('chat');
  const messagesEndRef = useRef(null);

  const modes = [
    { id: 'chat', name: '💬 Chat', description: 'AI-powered conversation' },
    { id: 'video', name: '🎬 Video', description: 'Generate video scripts' },
    { id: 'social', name: '📱 Social', description: 'Social media content' },
    { id: 'twitch', name: '🎮 Twitch', description: 'Streaming content' },
    { id: 'clips', name: '✂️ Clips', description: 'Video clip generation' }
  ];

  const suggestions = [
    "Create a viral TikTok video script about productivity tips",
    "Generate a YouTube video script for a product review",
    "Write a Twitch stream intro for a gaming channel",
    "Create Instagram Reel content for fitness motivation",
    "Generate a Twitter thread about AI technology",
    "Make a TikTok clip for cooking tutorial"
  ];

  useEffect(() => {
    loadUserPlan();
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadUserPlan = () => {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const user = JSON.parse(userSession);
      setUserPlan(user.plan || 'Free');
      setRemainingFree(user.remainingFree || 2);
    }
  };

  const generateResponse = async (userMessage) => {
    setLoading(true);
    
    try {
      // Create a mock user session for demo purposes
      const mockUser = {
        id: 'demo_user',
        email: 'demo@influencore.com',
        plan: userPlan,
        remainingFree: remainingFree
      };
      localStorage.setItem('userSession', JSON.stringify(mockUser));

      const response = await axios.post(`/api/generate-text`, {
        message: userMessage,
        mode: selectedMode
      });

      if (response.data.content) {
        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          content: response.data.content,
          timestamp: new Date().toISOString(),
          mode: selectedMode
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Update remaining free generations
        if (response.data.remainingFree !== undefined) {
          setRemainingFree(response.data.remainingFree);
        }
      }
    } catch (err) {
      if (err.response?.data?.upgradeRequired) {
        setShowUpgradeModal(true);
      } else {
        // Fallback response for demo
        const fallbackResponse = getFallbackResponse(userMessage, selectedMode);
        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          content: fallbackResponse,
          timestamp: new Date().toISOString(),
          mode: selectedMode
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    }
    setLoading(false);
  };

  const getFallbackResponse = (message, mode) => {
    const responses = {
      chat: `Here's a helpful response to "${message}":\n\nI understand you're looking for assistance. As an AI content generator, I can help you create engaging content across various platforms. What specific type of content would you like to generate?`,
      video: `🎬 VIDEO SCRIPT:\n\nBased on your request "${message}", here's a video script:\n\nINTRO (0-10s): "Hey everyone! Today we're going to..."\n\nMAIN CONTENT (10s-2min): Detailed explanation and demonstration\n\nCONCLUSION (2min-2:30s): "Don't forget to like and subscribe!"\n\n#VideoScript #ContentCreation`,
      social: `📱 SOCIAL MEDIA CONTENT:\n\n"${message}"\n\n✨ Perfect for your social media! Here's an engaging post:\n\n"🚀 Ready to level up your game? This is the secret weapon you've been waiting for! 💪\n\n#GameChanger #LevelUp #ContentCreation"`,
      twitch: `🎮 TWITCH CONTENT:\n\n"${message}"\n\nHere's your Twitch stream content:\n\n"🔥 LIVE NOW: Epic gaming session! Join the fun and let's dominate together! 🎮\n\nChat with us and share your gaming tips! #Twitch #Gaming #LiveStream"`,
      clips: `✂️ VIDEO CLIP:\n\n"${message}"\n\n🎬 CLIP SCRIPT:\n\nHOOK (0-3s): "You won't believe what just happened..."\n\nCONTENT (3-15s): Show the exciting moment\n\nCTA (15-20s): "Tap to see more!"\n\n#ViralClip #Trending #ContentCreation`
    };
    
    return responses[mode] || responses.chat;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      mode: selectedMode
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    await generateResponse(input);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">🎯 Influencore AI</h1>
            <div className="flex space-x-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedMode === mode.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Freemium Status */}
          {userPlan === 'Free' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">{remainingFree} free generations</span>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700 transition-colors"
              >
                Upgrade
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Influencore AI</h2>
            <p className="text-gray-400 mb-6">Generate amazing content for social media, videos, and more!</p>
            
            {/* Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-3 bg-gray-800 rounded-lg text-left hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  <p className="text-white text-sm">{suggestion}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="flex items-start space-x-3">
                {message.type === 'ai' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    AI
                  </div>
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4 max-w-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  AI
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask me to generate ${selectedMode === 'video' ? 'video scripts' : selectedMode === 'social' ? 'social media content' : selectedMode === 'twitch' ? 'Twitch content' : selectedMode === 'clips' ? 'video clips' : 'content'}...`}
            className="flex-1 p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-white placeholder-gray-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">💎 Upgrade Required</h3>
            <p className="text-gray-300 mb-4">
              You've reached your free limit. Upgrade to continue generating amazing content!
            </p>
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Unlimited AI generations</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Video script generation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Twitch & streaming content</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Video clip creation</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  window.location.href = '/pricing';
                }}
                className="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
