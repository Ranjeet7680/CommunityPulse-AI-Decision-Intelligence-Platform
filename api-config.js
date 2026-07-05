/* =========================================================
   CommunityPulse AI — API Configuration & Client
   Centralized API calls with error handling
   ========================================================= */

'use strict';

// API Configuration
const API_CONFIG = {
  BASE_URL: (() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) return window.location.origin;
    return window.location.port === '8000' ? 'http://localhost:8080' : 'http://localhost:8000';
  })(),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Token management
const TokenManager = {
  get accessToken() {
    return localStorage.getItem('access_token');
  },
  
  set accessToken(token) {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  },
  
  get refreshToken() {
    return localStorage.getItem('refresh_token');
  },
  
  set refreshToken(token) {
    if (token) {
      localStorage.setItem('refresh_token', token);
    } else {
      localStorage.removeItem('refresh_token');
    }
  },
  
  clear() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  },
  
  saveUserInfo(userInfo) {
    localStorage.setItem('user_info', JSON.stringify(userInfo));
  },
  
  getUserInfo() {
    const info = localStorage.getItem('user_info');
    return info ? JSON.parse(info) : null;
  }
};

// API Client with error handling and retry logic
class APIClient {
  constructor(config = API_CONFIG) {
    this.config = config;
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
  
  /**
   * Build full URL from endpoint
   */
  buildUrl(endpoint) {
    const base = this.config.BASE_URL.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }
  
  /**
   * Get headers for API requests
   */
  getHeaders(includeAuth = true, contentType = 'application/json') {
    const headers = {};
    
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    if (includeAuth && TokenManager.accessToken) {
      headers['Authorization'] = `Bearer ${TokenManager.accessToken}`;
    }
    
    return headers;
  }
  
  /**
   * Handle API response
   */
  async handleResponse(response) {
    // Check if response is ok
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    }
    
    // Handle error responses
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText || 'An error occurred' };
    }
    
    const error = new Error(errorData.detail || errorData.message || 'Request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  
  /**
   * Retry failed requests
   */
  async retry(fn, attempts = this.config.RETRY_ATTEMPTS) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        // Don't retry on client errors (4xx) except 401
        if (error.status && error.status >= 400 && error.status < 500 && error.status !== 401) {
          throw error;
        }
        
        // Last attempt, throw error
        if (i === attempts - 1) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => 
          setTimeout(resolve, this.config.RETRY_DELAY * (i + 1))
        );
      }
    }
  }
  
  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }
    
    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = TokenManager.refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await fetch(this.buildUrl('/api/v1/auth/refresh-token'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (!response.ok) {
          throw new Error('Token refresh failed');
        }
        
        const data = await response.json();
        TokenManager.accessToken = data.access_token;
        TokenManager.refreshToken = data.refresh_token;
        
        return data.access_token;
      } catch (error) {
        // Clear tokens and redirect to login
        TokenManager.clear();
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();
    
    return this.refreshPromise;
  }
  
  /**
   * Make API request with automatic token refresh
   */
  async request(endpoint, options = {}) {
    const makeRequest = async (useAuth = true) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.TIMEOUT);
      
      try {
        const response = await fetch(this.buildUrl(endpoint), {
          ...options,
          headers: {
            ...this.getHeaders(useAuth),
            ...options.headers
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return await this.handleResponse(response);
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        
        throw error;
      }
    };
    
    try {
      return await this.retry(() => makeRequest());
    } catch (error) {
      // Try refreshing token on 401
      if (error.status === 401 && TokenManager.refreshToken) {
        try {
          await this.refreshAccessToken();
          return await this.retry(() => makeRequest());
        } catch (refreshError) {
          // Refresh failed, redirect to login
          window.location.hash = '#/auth/login';
          throw new Error('Session expired. Please login again.');
        }
      }
      
      throw error;
    }
  }
  
  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }
  
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
  
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        ...this.getHeaders(true, null) // No Content-Type for FormData
      }
    });
  }
}

// Create global API client instance
const api = new APIClient();

// API Service Methods
const AuthAPI = {
  async register(email, password, name, orgName) {
    const response = await api.post('/api/v1/auth/register', {
      email,
      password,
      name,
      org_name: orgName
    });
    
    // Save tokens and user info
    TokenManager.accessToken = response.access_token;
    TokenManager.refreshToken = response.refresh_token;
    TokenManager.saveUserInfo({
      userId: response.user_id,
      role: response.role,
      email
    });
    
    return response;
  },
  
  async login(email, password) {
    const response = await api.post('/api/v1/auth/login', {
      email,
      password
    });
    
    // Save tokens and user info
    TokenManager.accessToken = response.access_token;
    TokenManager.refreshToken = response.refresh_token;
    TokenManager.saveUserInfo({
      userId: response.user_id,
      role: response.role,
      email
    });
    
    return response;
  },
  
  async googleLogin(idToken) {
    const response = await api.post('/api/v1/auth/google-login', {
      token: idToken
    });
    
    TokenManager.accessToken = response.access_token;
    TokenManager.refreshToken = response.refresh_token;
    
    return response;
  },
  
  async getProfile() {
    return api.get('/api/v1/auth/profile');
  },
  
  async updateProfile(updates) {
    return api.put('/api/v1/auth/profile', updates);
  },
  
  logout() {
    TokenManager.clear();
    window.location.hash = '#/auth/login';
  }
};

const DatasetAPI = {
  async upload(file) {
    return api.uploadFile('/api/v1/datasets/upload', file);
  },
  
  async list() {
    return api.get('/api/v1/datasets/');
  },
  
  async get(datasetId) {
    return api.get(`/api/v1/datasets/${datasetId}`);
  },
  
  async delete(datasetId) {
    return api.delete(`/api/v1/datasets/${datasetId}`);
  },
  
  async preview(datasetId) {
    return api.get(`/api/v1/datasets/${datasetId}/preview`);
  },
  
  async validate(datasetId) {
    return api.post(`/api/v1/datasets/${datasetId}/validate`);
  }
};

const AIAPI = {
  async chat(message, context = {}) {
    return api.post('/api/v1/ai-assistant/chat', {
      message,
      context
    });
  },
  
  async summarizeDataset(datasetId) {
    return api.post('/api/v1/ai-assistant/summarize-dataset', {
      dataset_id: datasetId
    });
  },
  
  async getRecommendations() {
    return api.get('/api/v1/ai-assistant/recommendations');
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { api, AuthAPI, DatasetAPI, AIAPI, TokenManager, API_CONFIG };
}
