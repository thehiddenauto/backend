import React, { useState, useEffect } from 'react';

export default function Library() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');

  useEffect(() => {
    loadPosts();
    // Add sample data for demo if no posts exist
    const savedPosts = localStorage.getItem('libraryPosts');
    if (!savedPosts || JSON.parse(savedPosts).length === 0) {
      addSamplePosts();
    }
  }, []);

  const loadPosts = () => {
    const savedPosts = localStorage.getItem('libraryPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  };

  const savePosts = (newPosts) => {
    localStorage.setItem('libraryPosts', JSON.stringify(newPosts));
    setPosts(newPosts);
  };

  const addPost = (post) => {
    const newPost = {
      id: Date.now(),
      ...post,
      createdAt: new Date().toISOString(),
      tags: post.tags || []
    };
    savePosts([newPost, ...posts]);
  };

  const deletePost = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      savePosts(posts.filter(post => post.id !== id));
      if (selectedPost?.id === id) {
        setSelectedPost(null);
      }
    }
  };

  const updatePost = (id, updates) => {
    const updatedPosts = posts.map(post => 
      post.id === id ? { ...post, ...updates } : post
    );
    savePosts(updatedPosts);
    if (selectedPost?.id === id) {
      setSelectedPost({ ...selectedPost, ...updates });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlatform = filterPlatform === 'all' || post.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  const exportPosts = () => {
    const dataStr = JSON.stringify(posts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'social-media-posts.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const addSamplePosts = () => {
    const samplePosts = [
      {
        id: Date.now() - 1000,
        title: "Viral TikTok Product Launch",
        content: "🎯 POV: You just discovered our new product and your life is about to change forever...\n\nThis isn't just another product - it's THE product that's going viral right now! 🔥\n\n• Game-changing features\n• Affordable luxury\n• Instant results\n\nDon't be the last to know! #TikTokMadeMeBuyIt #ViralProduct #MustHave",
        platform: "TikTok",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        tags: ["viral", "product launch", "tiktok", "trending"]
      },
      {
        id: Date.now() - 2000,
        title: "Instagram Lifestyle Post",
        content: "✨ Transform your routine with our premium product - because you deserve the best! 🌟\n\nThis isn't just another product, it's a lifestyle upgrade that's changing everything:\n\n💎 Premium quality\n💎 Professional results\n💎 Affordable luxury\n\nReady to level up? Swipe up to discover the magic! ✨\n\n#Lifestyle #Transformation #Premium #Upgrade",
        platform: "Instagram",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        tags: ["lifestyle", "premium", "transformation", "instagram"]
      },
      {
        id: Date.now() - 3000,
        title: "YouTube Product Review",
        content: "🎬 NEW: Product Review - This might be the game-changer you've been looking for!\n\nIn this video, I'm testing our latest product and sharing everything you need to know:\n\n⏰ Timestamps:\n0:00 - Introduction\n1:30 - Unboxing\n3:45 - First impressions\n6:20 - Testing phase\n10:15 - Results\n12:30 - Final verdict\n\nIs it worth the hype? Let's find out together!\n\n#Review #NewProduct #Testing #GameChanger",
        platform: "YouTube",
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        tags: ["review", "youtube", "testing", "gamechanger"]
      },
      {
        id: Date.now() - 4000,
        title: "Twitter Hot Take",
        content: "Just tried our new product and... 🤯\n\nGame. Changer.\n\nThis is what we've been waiting for. Period.\n\n#Innovation #Tech #GameChanger #MustHave",
        platform: "Twitter",
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        tags: ["hot take", "twitter", "innovation", "tech"]
      }
    ];
    savePosts(samplePosts);
  };

  const importPosts = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedPosts = JSON.parse(e.target.result);
          savePosts([...posts, ...importedPosts]);
          alert('Posts imported successfully!');
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Content Library</h2>
        <div className="flex space-x-2">
          <input
            type="file"
            accept=".json"
            onChange={importPosts}
            className="hidden"
            id="import-posts"
          />
          <label
            htmlFor="import-posts"
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            📁 Import
          </label>
          <button
            onClick={exportPosts}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            📤 Export
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="TikTok">TikTok</option>
            <option value="Instagram">Instagram</option>
            <option value="YouTube">YouTube</option>
            <option value="Twitter">Twitter</option>
          </select>
          <div className="text-sm text-gray-400">
            {filteredPosts.length} of {posts.length} posts
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Posts</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPosts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No posts found</p>
              ) : (
                filteredPosts.map(post => (
                  <div
                    key={post.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPost?.id === post.id 
                        ? 'bg-blue-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium truncate">{post.title || 'Untitled'}</h4>
                        <p className="text-sm text-gray-400 truncate">{post.content}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs bg-gray-600 px-2 py-1 rounded">{post.platform}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePost(post.id);
                        }}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Post Details */}
        <div className="lg:col-span-2">
          {selectedPost ? (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Post Details</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={selectedPost.title || ''}
                    onChange={(e) => updatePost(selectedPost.id, { title: e.target.value })}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={selectedPost.content || ''}
                    onChange={(e) => updatePost(selectedPost.id, { content: e.target.value })}
                    rows="6"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Platform</label>
                    <select
                      value={selectedPost.platform || ''}
                      onChange={(e) => updatePost(selectedPost.id, { platform: e.target.value })}
                      className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Platform</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Twitter">Twitter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Created</label>
                    <input
                      type="text"
                      value={new Date(selectedPost.createdAt).toLocaleString()}
                      disabled
                      className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    value={selectedPost.tags?.join(', ') || ''}
                    onChange={(e) => updatePost(selectedPost.id, { 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                    placeholder="Enter tags separated by commas"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPost.content);
                      alert('Content copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📋 Copy Content
                  </button>
                  <button
                    onClick={() => {
                      const postData = JSON.stringify(selectedPost, null, 2);
                      navigator.clipboard.writeText(postData);
                      alert('Post data copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    📄 Copy JSON
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-center">
              <p className="text-gray-400">Select a post to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 