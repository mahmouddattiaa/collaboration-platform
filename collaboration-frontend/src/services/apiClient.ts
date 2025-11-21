import { ApiResponse, HttpMethod, RequestOptions } from '@/types/api';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set auth token for requests
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Main request method
  async request<T>(
    endpoint: string,
    options: RequestOptions = { method: 'GET' }
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = {
        ...this.defaultHeaders,
        ...options.headers,
      };

      // Add token if provided in options
      if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
      }

      const config: RequestInit = {
        method: options.method,
        headers,
      };

      // Add body if provided
      if (options.body && options.method !== 'GET') {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);
      
      // Try to parse as JSON, fallback to text for non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: false, message: text };
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  async post<T>(endpoint: string, body: any, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, token });
  }

  async put<T>(endpoint: string, body: any, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, token });
  }

  async patch<T>(endpoint: string, body: any, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, token });
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }
}

// Create and export API client instance - Use API_BASE_URL from config
import { API_BASE_URL } from '@/config/api';
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
