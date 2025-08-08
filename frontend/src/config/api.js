// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  GENERATE_TEXT: `${API_BASE_URL}/api/generate-text`,
  GENERATE_VIDEO: `${API_BASE_URL}/api/generate-video`,
  UPLOAD_VIDEO: `${API_BASE_URL}/api/upload-video`,
  CLIP_VIDEO: `${API_BASE_URL}/api/clip-video`,
  USER_PROFILE: `${API_BASE_URL}/api/user/profile`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  BILLING: `${API_BASE_URL}/api/billing`,
  SOCIAL_CONNECT: `${API_BASE_URL}/api/social/connect`,
  LIBRARY: `${API_BASE_URL}/api/library`,
};

// API utility functions
export const apiClient = {
  async get(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  async post(endpoint, data = {}, options = {}) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  async put(endpoint, data = {}, options = {}) {
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  async delete(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
};

// Health check function
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.HEALTH);
    console.log('✅ Backend health check successful:', response);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
};

// Initialize health check on app start
export const initializeApi = async () => {
  const isHealthy = await checkBackendHealth();
  if (!isHealthy) {
    console.warn('⚠️ Backend connection failed. Some features may not work.');
  }
  return isHealthy;
}; 