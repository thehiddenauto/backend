import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdvancedVideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('veo3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [models, setModels] = useState([]);
  const [capabilities, setCapabilities] = useState({});
  const [imageUrl, setImageUrl] = useState('');
  const [options, setOptions] = useState({
    duration: 10,
    fps: 24,
    resolution: '1920x1080',
    style: 'cinematic',
    quality: 'high'
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/video-models');
      setModels(response.data.models);
      setCapabilities(response.data.capabilities);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const generateVideo = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedVideo(null);

    try {
      let endpoint = '';
      let requestData = { prompt, options };

      switch (selectedModel) {
        case 'veo3':
          endpoint = '/api/generate-veo3-video';
          break;
        case 'sora':
          endpoint = '/api/generate-sora-video';
          break;
        case 'viral':
          endpoint = '/api/generate-viral-short';
          break;
        case 'image-to-video':
          endpoint = '/api/generate-video-from-image';
          requestData = { imageUrl, prompt, options };
          break;
        default:
          endpoint = '/api/generate-veo3-video';
      }

      const response = await axios.post(endpoint, requestData);
      setGeneratedVideo(response.data);
    } catch (error) {
      console.error('Video generation failed:', error);
      alert('Video generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getModelInfo = (modelKey) => {
    return capabilities[modelKey] || {
      name: modelKey,
      capabilities: ['Text-to-video'],
      maxDuration: 10,
      resolutions: ['1920x1080']
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">🎬 Advanced Video Generator</h1>
          <p className="text-gray-400">Google Veo 3 & Sora-level video generation</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Model Selection */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold mb-4">Choose AI Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => {
              const info = getModelInfo(model);
              return (
                <div
                  key={model}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModel === model
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  <h3 className="font-bold text-lg mb-2">{info.name}</h3>
                  <div className="text-sm text-gray-400 mb-2">
                    <div>Max Duration: {info.maxDuration}s</div>
                    <div>Resolutions: {info.resolutions.join(', ')}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {info.capabilities.join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold mb-4">Video Generation</h2>
          
          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Video Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate... (e.g., 'A cinematic shot of a futuristic city at sunset with flying cars')"
              className="w-full p-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-white placeholder-gray-400"
              rows="4"
            />
          </div>

          {/* Image URL Input (for image-to-video) */}
          {selectedModel === 'image-to-video' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full p-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-white placeholder-gray-400"
              />
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={options.duration}
                onChange={(e) => setOptions({...options, duration: parseInt(e.target.value)})}
                min="1"
                max="60"
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">FPS</label>
              <select
                value={options.fps}
                onChange={(e) => setOptions({...options, fps: parseInt(e.target.value)})}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
              >
                <option value="24">24 FPS</option>
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Resolution</label>
              <select
                value={options.resolution}
                onChange={(e) => setOptions({...options, resolution: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
              >
                <option value="1920x1080">1920x1080 (HD)</option>
                <option value="1280x720">1280x720 (HD)</option>
                <option value="3840x2160">3840x2160 (4K)</option>
                <option value="1080x1920">1080x1920 (Vertical)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quality</label>
              <select
                value={options.quality}
                onChange={(e) => setOptions({...options, quality: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
              >
                <option value="high">High</option>
                <option value="ultra-high">Ultra High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateVideo}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {isGenerating ? '🎬 Generating Video...' : '🎬 Generate Video'}
          </button>
        </div>

        {/* Generated Video */}
        {generatedVideo && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Generated Video</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Player */}
              <div>
                <video
                  controls
                  className="w-full rounded-lg"
                  src={generatedVideo.video.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Info */}
              <div>
                <h3 className="text-xl font-bold mb-4">Video Details</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Model:</strong> {generatedVideo.video.model}</div>
                  <div><strong>Duration:</strong> {generatedVideo.video.duration}s</div>
                  <div><strong>Resolution:</strong> {generatedVideo.video.resolution}</div>
                  <div><strong>Prompt:</strong> {generatedVideo.video.prompt}</div>
                  {generatedVideo.video.note && (
                    <div className="text-yellow-400"><strong>Note:</strong> {generatedVideo.video.note}</div>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => window.open(generatedVideo.video.videoUrl, '_blank')}
                    className="w-full py-2 bg-green-600 rounded hover:bg-green-700 transition-colors"
                  >
                    📥 Download Video
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedVideo.video.videoUrl)}
                    className="w-full py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors"
                  >
                    📋 Copy Video URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Info */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-8">
          <h2 className="text-2xl font-bold mb-4">Usage Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-bold">Remaining Free Generations</div>
              <div className="text-blue-400">{generatedVideo?.remainingFree || 2}</div>
            </div>
            <div>
              <div className="font-bold">Current Plan</div>
              <div className="text-green-400">{generatedVideo?.plan || 'Free'}</div>
            </div>
            <div>
              <div className="font-bold">Total Used</div>
              <div className="text-gray-400">{generatedVideo?.usage?.aiGenerations || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 