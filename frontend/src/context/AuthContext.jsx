import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from './authContext';

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading] = useState(false);

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Check if a user is already logged in when the app loads
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response, // If the request is successful, just return it
      (error) => {
        // If the backend says "401 Unauthorized" (Token expired or invalid)
        if (error.response && error.response.status === 401) {
          logout(); // 1. Clear the dead token
          toast.error('Session expired. Please log in again.'); // 2. Notify the user
          window.location.href = '/login'; // 3. Force them to the login screen
        }
        return Promise.reject(error);
      }
    );

    // Cleanup function to remove the interceptor if the component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Register Function
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/users', userData);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  // Login Function
  const login = async (userData) => {
    try {
      const response = await axios.post('/api/users/login', userData);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};