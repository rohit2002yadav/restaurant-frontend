import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = (userData, tokens) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (tokens) {
      localStorage.setItem('accessToken',  tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
    }
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh) {
      try {
        // Blacklist the refresh token so it cannot be reused after logout
        await axios.post(
          `${API_BASE_URL}/api/auth/token/blacklist/`,
          { refresh },
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch {
        // Server unreachable or token already blacklisted — proceed anyway
      }
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('queueToken');
    localStorage.removeItem('queueRestaurantId');
    localStorage.removeItem('pendingEmail');
    localStorage.removeItem('pendingRole');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin:    user?.role === 'admin',
      isCustomer: user?.role === 'customer',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
