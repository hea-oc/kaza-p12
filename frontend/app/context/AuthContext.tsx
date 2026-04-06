'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateUser: (changes: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fournisseur du contexte d'authentification.
 * Persiste la session dans localStorage (token JWT + données utilisateur).
 * Au login, charge automatiquement les favoris de l'utilisateur depuis la DB.
 * Au logout, efface le token, les données utilisateur et les favoris locaux.
 *
 * @param children - Composants enfants ayant accès au contexte
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le token au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const error = isJson ? await res.json() : null;
      throw new Error(error?.error || error?.message || `Erreur serveur (${res.status})`);
    }

    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.removeItem('kasa_favorites'); // vider les favoris de l'ancien compte
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    // Charger les favoris de ce compte depuis la DB
    try {
      const favRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${data.user.id}/favorites`, {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      if (favRes.ok) {
        const favData = await favRes.json();
        const ids = Array.isArray(favData) ? favData.map((p: { id: string }) => p.id) : [];
        localStorage.setItem('kasa_favorites', JSON.stringify(ids));
      }
    } catch {}
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string, role = 'client') => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${firstName} ${lastName}`, email, password, role })
    });

    if (!res.ok) {
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const error = isJson ? await res.json() : null;
      throw new Error(error?.error || error?.message || `Erreur serveur (${res.status})`);
    }

    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  };

  const updateUser = (changes: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...changes };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('kasa_favorites');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte d'authentification.
 * Doit être utilisé dans un composant enfant de AuthProvider.
 *
 * @returns Le contexte auth : user, token, login, signup, logout, updateUser, isLoading
 * @throws Error si utilisé hors de AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
