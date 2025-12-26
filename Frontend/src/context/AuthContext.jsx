import React, { createContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken, verifyToken, logout as apiLogout } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      
      if (token) {
        try {
          const userData = await verifyToken();
          setUser(userData.user || userData);
        } catch (err) {
          console.error('Auth verification failed:', err);
          setAuthToken(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
