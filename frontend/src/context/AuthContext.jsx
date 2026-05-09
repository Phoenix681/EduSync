import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { AuthContext } from './authContext';

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading] = useState(false);
  
  // NEW: State to track unread messages for the Navbar badge
  const [unreadCount, setUnreadCount] = useState(0);

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setUnreadCount(0); // Clear the badge when they log out
  };

  // ==========================================
  // EFFECT 1: Security & Token Expiration
  // ==========================================
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response, 
      (error) => {
        if (error.response && error.response.status === 401) {
          logout(); 
          toast.error('Session expired. Please log in again.'); 
          window.location.href = '/login'; 
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []); // Empty array = only runs once on app load

  // ==========================================
  // EFFECT 2: Fetch Unread Message Count
  // ==========================================
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user || !user.token) return; // Don't fetch if not logged in
      
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/messages/unread-count', config);
        setUnreadCount(data.count);
      } catch{
        console.error("Failed to fetch unread count");
      }
    };

    fetchUnreadCount();
  }, [user]); // This runs whenever the 'user' state changes (e.g., successful login)

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
    // NEW: Don't forget to expose unreadCount and setUnreadCount here!
    <AuthContext.Provider value={{ user, setUser, register, login, logout, unreadCount, setUnreadCount }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};