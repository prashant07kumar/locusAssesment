import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = jwtDecode(token);
      // Optional: Check if token is expired
      if (decodedUser.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
      } else {
        setUser({ ...decodedUser, role: decodedUser.role || 'student' });
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role = 'student') => {
    const { data } = await api.post('/api/auth/login', { email, password, role });
    if (data.role !== role) {
      throw new Error(`Invalid credentials for ${role} login`);
    }
    localStorage.setItem('token', data.token);
    const decodedUser = jwtDecode(data.token);
    setUser({ ...decodedUser, name: data.name, role: data.role });
    return data;
  };

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/api/auth/register', { name, email, password, role });
    localStorage.setItem('token', data.token);
    const decodedUser = jwtDecode(data.token);
    setUser({ ...decodedUser, name: data.name, role: data.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;