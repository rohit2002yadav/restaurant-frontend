import { createContext, useContext, useState } from 'react';

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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('queueToken');
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
