import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, logout, isLoading, checkAuth, admin } = useAdminAuth();
  
  // Check authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuth();
      if (!authenticated) {
        toast({
          title: "Authentication required",
          description: "Please login to access the admin area",
        });
        setLocation("/admin/login");
      }
    };
    
    verifyAuth();
  }, [checkAuth, setLocation, toast]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // The logout function in useAdminAuth will handle redirect and toast
    } catch (error) {
      // Error handling is done in the useAdminAuth hook
    }
  };
  
  // If still checking authentication, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verifying authentication...</span>
      </div>
    );
  }
  
  // If not authenticated, don't render admin layout
  if (!isAuthenticated) {
    return null;
  }
  
  // Navigation items based on role
  const navItems = [
    { href: "/admin/quick-update", label: "Quick Update" },
    { href: "/admin/exchange-rates", label: "Exchange Rates" },
    // Only show providers page for full admins
    ...(admin?.role === 'admin' ? [{ href: "/admin/providers", label: "Providers" }] : [])
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin/exchange-rates">
                  <span className="text-xl font-bold text-primary cursor-pointer">
                    Gulf Rate Admin
                  </span>
                </Link>
              </div>
              <div className="ml-6 flex space-x-4">
                {navItems.map((item) => (
                  <Link href={item.href} key={item.href}>
                    <span
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                        location === item.href
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  admin?.role === 'admin' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {admin?.role === 'admin' ? 'Admin' : 'Editor'}
                </div>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {admin?.username}
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}