import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuthStatus = () => {
      const token = apiService.getAuthToken();
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      
      // Check if login was successful based on API response
      if (response.status === "true" || response.status === true) {
        // Store the authentication token
        if (response.token) {
          apiService.setAuthToken(response.token);
        }
        
        // Store user data
        const userData = {
          username: response.username,
          message: response.message
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return response;
      } else {
        // Login failed
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiService.removeAuthToken();
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  const getToken = () => {
    return apiService.getAuthToken();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 