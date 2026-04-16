import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users (dummy untuk testing)
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@showroom.com',
    password: 'admin123',
    name: 'Admin Showroom',
    role: 'admin' as UserRole,
  },
  {
    id: '2',
    email: 'user@showroom.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user' as UserRole,
  },
];

const STORAGE_KEY = '@auth_user';
const STORAGE_USERS_KEY = '@registered_users';

async function getRegisteredUsers() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting registered users:', error);
    return [];
  }
}

async function saveRegisteredUsers(users: any[]) {
  try {
    await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving registered users:', error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user sudah login sebelumnya
  useEffect(() => {
    async function checkAuth() {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check mock users first
      let foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password);

      // If not found in mock, check registered users
      if (!foundUser) {
        const registeredUsers = await getRegisteredUsers();
        const registered = registeredUsers.find(
          (u: any) => u.email === email && u.password === password
        );
        if (registered) {
          foundUser = registered;
        }
      }

      if (!foundUser) {
        throw new Error('Email atau password salah');
      }

      const authUser: AuthUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Check if email sudah digunakan
      let existingUser = MOCK_USERS.find((u) => u.email === email);
      if (!existingUser) {
        const registeredUsers = await getRegisteredUsers();
        existingUser = registeredUsers.find((u: any) => u.email === email);
      }

      if (existingUser) {
        throw new Error('Email sudah digunakan');
      }

      // Create new user
      const registeredUsers = await getRegisteredUsers();
      const newUser = {
        id: `reg_${Date.now()}`,
        email,
        password,
        name,
        role: 'user' as UserRole,
      };

      registeredUsers.push(newUser);
      await saveRegisteredUsers(registeredUsers);

      // Auto login after registration
      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSignedIn: user !== null,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
