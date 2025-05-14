import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post("/api/admin/logout");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      setLocation("/admin/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error during logout.",
        variant: "destructive",
      });
    }
  };
  
  // Navigation items
  const navItems = [
    { href: "/admin/exchange-rates", label: "Exchange Rates" },
    { href: "/admin/providers", label: "Providers" }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin/exchange-rates">
                  <span className="text-xl font-bold text-primary-600 cursor-pointer">
                    Gulf Rate Admin
                  </span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link href={item.href} key={item.href}>
                    <span
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                        location === item.href
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Button variant="ghost" onClick={handleLogout}>
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