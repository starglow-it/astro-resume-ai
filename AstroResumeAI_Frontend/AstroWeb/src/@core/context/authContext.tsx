// src/@core/context/authContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  // Use effect to read the token from local storage or cookies when the app loads
  useEffect(() => {
    const storedToken = localStorage.getItem('token'); // Or your token storage logic
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const isAuthenticated = !!token;

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken); // Or your token storage logic
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token'); // Or your token removal logic
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
