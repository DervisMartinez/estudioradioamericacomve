import React, { createContext, useState, ReactNode } from 'react';

export type Role = 'Super Admin' | 'Admin' | 'Editor' | 'Productor';

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  role: Role;
  name: string;
}

interface AuthContextType {
  users: UserAccount[];
  currentUser: UserAccount | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  addUser: (user: UserAccount) => void;
  deleteUser: (id: string) => void;
}

const defaultUsers: UserAccount[] = [
  {
    id: 'admin1',
    email: 'estudio@radioamerica.com.ve',
    password: 'america909.estudio',
    role: 'Super Admin',
    name: 'Súper Administrador'
  }
];

const safeAuthGet = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    return defaultValue;
  }
};

export const AuthContext = createContext<AuthContextType>({
  users: [], currentUser: null, login: () => false, logout: () => {}, addUser: () => {}, deleteUser: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => safeAuthGet('radio_users', defaultUsers));
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => safeAuthGet('radio_current_user', null));

  const login = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const checkEmail = cleanEmail === 'estudio@radiomerica.com.ve' ? 'estudio@radioamerica.com.ve' : cleanEmail;
    const user = users.find(u => u.email.toLowerCase() === checkEmail && u.password === pass.trim());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('radio_current_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('radio_current_user');
  };

  const addUser = (user: UserAccount) => {
    const newUsers = [user, ...users];
    setUsers(newUsers);
    localStorage.setItem('radio_users', JSON.stringify(newUsers));
  };

  const deleteUser = (id: string) => {
    const newUsers = users.filter(u => u.id !== id);
    setUsers(newUsers);
    localStorage.setItem('radio_users', JSON.stringify(newUsers));
  };

  return <AuthContext.Provider value={{ users, currentUser, login, logout, addUser, deleteUser }}>{children}</AuthContext.Provider>;
};