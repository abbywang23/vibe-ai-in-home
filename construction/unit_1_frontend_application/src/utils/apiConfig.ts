/**
 * Dynamic API configuration based on current host
 */

const DEFAULT_API_PORT = '3001';
const API_PATH = '/api/ai';

/**
 * Get the API base URL dynamically based on current window location
 * If accessing via localhost, use localhost for API calls
 * Otherwise use the configured environment variable
 */
export function getApiBaseUrl(): string {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // If accessing via localhost, use localhost for API
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return `http://localhost:${DEFAULT_API_PORT}${API_PATH}`;
    }
    
    // If accessing via IP address, use the same IP for API
    if (currentHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return `http://${currentHost}:${DEFAULT_API_PORT}${API_PATH}`;
    }
  }
  
  // Fallback to environment variable or default localhost
  return import.meta.env.VITE_AI_SERVICE_URL || `http://localhost:${DEFAULT_API_PORT}${API_PATH}`;
}

/**
 * Get the full API URL for a specific endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}