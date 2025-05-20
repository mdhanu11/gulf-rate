import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "./use-toast";
import { useLocation } from "wouter";

interface Admin {
  id: number;
  username: string;
  role: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Check authentication status on load
  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const response = await axios.get('/api/admin/check-auth');
        if (response.status === 200 && response.data.authenticated) {
          setAdmin(response.data.admin);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Not authenticated
        setAdmin(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/admin/login', { username, password });
      setAdmin(response.data.admin);
      setIsAuthenticated(true);
      toast({
        title: "Login successful",
        description: "Welcome back to the admin panel",
      });
      navigate("/admin/quick-update");
      return response.data;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/admin/logout');
      setAdmin(null);
      setIsAuthenticated(false);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/admin/login");
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
      throw error;
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/admin/check-auth');
      if (response.status === 200 && response.data.authenticated) {
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
        return true;
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      setAdmin(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}