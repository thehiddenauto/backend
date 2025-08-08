import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { initializeApi } from './config/api.js';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Generator from './pages/Generator.jsx';
import VideoClipper from './pages/VideoClipper.jsx';
import AdvancedVideoGenerator from './pages/AdvancedVideoGenerator.jsx';
import Library from './pages/Library.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';
import SocialConnector from './pages/SocialConnector.jsx';
import Pricing from './pages/Pricing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Billing from './pages/Billing.jsx';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const location = useLocation();

  // Initialize API connection
  useEffect(() => {
    const initApi = async () => {
      try {
        const isHealthy = await initializeApi();
        setBackendStatus(isHealthy ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Failed to initialize API:', error);
        setBackendStatus('disconnected');
      }
    };

    initApi();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navigation = [
    { name: 'Generator', href: '/generator', icon: '🤖' },
    { name: 'Video Clipper', href: '/clipper', icon: '✂️' },
    { name: 'Veo 3 & Sora', href: '/advanced-video', icon: '🎬' },
    { name: 'Library', href: '/library', icon: '📚' },
    { name: 'Social', href: '/social', icon: '📱' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  ];

  const userNavigation = [
    { name: 'Pricing', href: '/pricing' },
    { name: 'Sign In', href: '/login' },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 py-4" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-xl font-bold hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                aria-label="Influencore Home"
              >
                <span role="img" aria-label="target">🎯</span>
                <span>Influencore</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-1 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                  aria-label={`Navigate to ${item.name}`}
                >
                  <span role="img" aria-label={item.name.toLowerCase()}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Desktop User Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                  aria-label={`Navigate to ${item.name}`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="Start Free Trial"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded p-2"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden" id="mobile-menu">
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-700 mt-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium hover:text-blue-400 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    aria-label={`Navigate to ${item.name}`}
                  >
                    <span role="img" aria-label={item.name.toLowerCase()}>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-3 py-2 rounded-md text-base font-medium hover:text-blue-400 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                      aria-label={`Navigate to ${item.name}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 mt-2"
                    aria-label="Start Free Trial"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Backend Status Indicator */}
      {backendStatus === 'disconnected' && (
        <div className="bg-yellow-600 text-white px-4 py-2 text-center">
          <span role="img" aria-label="warning">⚠️</span>
          <span className="ml-2">Backend connection failed. Some features may not work.</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/clipper" element={<VideoClipper />} />
          <Route path="/advanced-video" element={<AdvancedVideoGenerator />} />
          <Route path="/library" element={<Library />} />
          <Route path="/social" element={<SocialConnector />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/billing" element={<Billing />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Influencore</h3>
              <p className="text-gray-400">AI-powered content creation platform for creators.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/generator" className="hover:text-white transition-colors">Generator</Link></li>
                <li><Link to="/clipper" className="hover:text-white transition-colors">Video Clipper</Link></li>
                <li><Link to="/library" className="hover:text-white transition-colors">Library</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Influencore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
