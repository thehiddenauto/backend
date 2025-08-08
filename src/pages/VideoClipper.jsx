import React, { useState } from 'react';

export default function VideoClipper() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [clips, setClips] = useState([]);

  const processingSteps = [
    'Analyzing video content...',
    'Identifying viral moments...',
    'Generating AI clips...',
    'Adding captions and effects...',
    'Optimizing for platforms...',
    'Finalizing clips...'
  ];

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    
    setIsProcessing(true);
    setProcessingStep('Starting video analysis...');
    
    // Simulate processing steps
    for (let i = 0; i < processingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProcessingStep(processingSteps[i]);
    }
    
    // Generate mock clips
    const mockClips = [
      {
        id: 1,
        title: 'Viral Moment #1',
        duration: '0:15',
        platform: 'TikTok',
        thumbnail: '🎬',
        description: 'High-energy opening that hooks viewers immediately'
      },
      {
        id: 2,
        title: 'Viral Moment #2',
        duration: '0:20',
        platform: 'Instagram',
        thumbnail: '📱',
        description: 'Perfect for Instagram Reels with trending music'
      },
      {
        id: 3,
        title: 'Viral Moment #3',
        duration: '0:12',
        platform: 'YouTube',
        thumbnail: '📺',
        description: 'YouTube Shorts optimized for maximum engagement'
      },
      {
        id: 4,
        title: 'Viral Moment #4',
        duration: '0:18',
        platform: 'TikTok',
        thumbnail: '🎬',
        description: 'Comedy moment that will go viral'
      },
      {
        id: 5,
        title: 'Viral Moment #5',
        duration: '0:25',
        platform: 'Instagram',
        thumbnail: '📱',
        description: 'Educational content perfect for Instagram'
      }
    ];
    
    setClips(mockClips);
    setIsProcessing(false);
    setProcessingStep('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">🎬 Video Clipper</h1>
          <p className="text-gray-400">Turn any video into viral clips with AI</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Video Upload */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold mb-6">Drop a video link</h2>
          <form onSubmit={handleVideoSubmit} className="space-y-4">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full p-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-white placeholder-gray-400"
              disabled={isProcessing}
            />
            <div className="text-sm text-gray-400">
              Supported platforms: YouTube, Google Drive, Vimeo, Zoom, Rumble, Twitch, Facebook, LinkedIn, Twitter, Loom, Riverside, StreamYard
            </div>
            <button
              type="submit"
              disabled={isProcessing || !videoUrl.trim()}
              className="px-8 py-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {isProcessing ? 'Processing...' : 'Generate Clips'}
            </button>
          </form>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-4">AI is processing your video</h3>
              <p className="text-gray-400 mb-6">{processingStep}</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Clips */}
        {clips.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Generated Clips ({clips.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clips.map((clip) => (
                <div key={clip.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{clip.thumbnail}</div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-blue-600 rounded text-xs">{clip.platform}</span>
                      <span className="px-2 py-1 bg-gray-600 rounded text-xs">{clip.duration}</span>
                    </div>
                  </div>
                  <h3 className="font-bold mb-2">{clip.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{clip.description}</p>
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 rounded text-sm hover:bg-blue-700 transition-colors">
                      Preview
                    </button>
                    <button className="flex-1 px-3 py-2 bg-green-600 rounded text-sm hover:bg-green-700 transition-colors">
                      Download
                    </button>
                    <button className="flex-1 px-3 py-2 bg-purple-600 rounded text-sm hover:bg-purple-700 transition-colors">
                      Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">AI-Powered Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-4">✂️</div>
              <h3 className="font-bold mb-2">Smart Clipping</h3>
              <p className="text-gray-400 text-sm">AI identifies the most engaging moments in your video</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-4">🎬</div>
              <h3 className="font-bold mb-2">Auto Captions</h3>
              <p className="text-gray-400 text-sm">Generate accurate captions with 97% accuracy</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="font-bold mb-2">Multi-Platform</h3>
              <p className="text-gray-400 text-sm">Optimize for TikTok, Instagram, YouTube, and more</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 