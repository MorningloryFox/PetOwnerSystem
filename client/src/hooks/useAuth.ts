import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
}

// Simple auth state management without context for now
let authState = {
  user: null as User | null,
  isLoading: true,
  callbacks: new Set<() => void>(),
};

function notifyCallbacks() {
  authState.callbacks.forEach(callback => callback());
}

export function useAuth() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const callback = () => forceUpdate({});
    authState.callbacks.add(callback);
    return () => {
      authState.callbacks.delete(callback);
    };
  }, []);

  useEffect(() => {
    if (authState.isLoading) {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiRequest('/api/auth/me', 'GET');
      const userData = await response.json();
      authState.user = userData;
    } catch (error) {
      authState.user = null;
    }
    authState.isLoading = false;
    notifyCallbacks();
  };

  const login = async (email: string, password: string): Promise<User> => {
    console.log("Attempting login with:", { email, password });
    const response = await apiRequest('/api/auth/login', 'POST', { email, password });
    const userData = await response.json();
    console.log("Login response:", userData);

    // Store token if provided
    if (userData.token) {
      localStorage.setItem('auth-token', userData.token);
    }

    authState.user = userData;
    notifyCallbacks();
    return userData;
  };

  const register = async (data: any): Promise<User> => {
    const response = await apiRequest('/api/auth/register', 'POST', data);
    const userData = await response.json();
    authState.user = userData;
    notifyCallbacks();
    return userData;
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', 'POST');
    } catch (error) {
      // Ignore errors on logout
    }
    authState.user = null;
    notifyCallbacks();
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!authState.user,
  };
}