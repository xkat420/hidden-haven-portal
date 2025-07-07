// API utility functions with authentication
const API_BASE_URL = 'http://localhost:3001';

// Get stored token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Create authenticated fetch wrapper
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  console.log('Making API request:', {
    endpoint,
    method: config.method || 'GET',
    hasToken: !!token,
    headers: config.headers
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  console.log('API response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error('API Error:', errorData);
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Convenience methods
export const api = {
  get: (endpoint: string) => apiRequest(endpoint),
  post: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint: string) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
};