import React, { createContext, useContext, useState, useEffect } from 'react';

if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is not defined in .env file');
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  license_number: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<{user: User | null}>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  getToken: () => Promise<string | null>;
}

interface RegisterData {
  email?: string;
  license_number?: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const login = async (identifier: string, password: string): Promise<{user: User | null}> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: identifier, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.access);
    setUser(data.user);
    return { user: data.user };
  };

  const register = async (userData: RegisterData) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const getToken = async () => {
    return localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
