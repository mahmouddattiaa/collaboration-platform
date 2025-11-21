import { useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '@/types/auth';
import authService from '@/services/authService';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        const token = authService.getToken();
        const user = authService.getUser();
        console.log('🔐 Token from storage:', token ? 'exists' : 'null');
        console.log('🔐 User from storage:', user ? user : 'null');

        if (token && user) {
          console.log('🔐 Token and user found, verifying token...');
          // Verify token is still valid by getting fresh user data
          try {
            const freshUser = await authService.getProfile(token);
            console.log('✅ Token verified, user authenticated:', freshUser.name);
            setAuthState({
              user: freshUser,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            console.error('❌ Token verification failed:', error);
            // Token is invalid, clear auth
            authService.logout();
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          console.log('❌ No token or user in storage');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        authService.saveToken(response.token);
        authService.saveUser(response.user);
        
        setAuthState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  }, []);

  // Register function
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await authService.register({ name, email, password });
      
      if (response.success) {
        authService.saveToken(response.token);
        authService.saveUser(response.user);
        
        setAuthState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
  };
}
