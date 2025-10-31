import apiClient from './apiClient';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  User 
} from '@/types/auth';

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/api/auth/login',
      credentials
    );
    return response as LoginResponse;
  }

  // Register user
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      '/api/auth/register',
      userData
    );
    return response as RegisterResponse;
  }

  // Get current user profile
  async getProfile(token: string): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/me', token);
    return response.data as User;
  }

  // Token management
  saveToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken() {
    localStorage.removeItem('authToken');
  }

  // User data management
  saveUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  removeUser() {
    localStorage.removeItem('user');
  }

  // Complete logout
  logout() {
    this.removeToken();
    this.removeUser();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }
}

// Create and export auth service instance
export const authService = new AuthService();
export default authService;
