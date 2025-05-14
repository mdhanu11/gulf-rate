import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Form schema for login
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Initialize form with react-hook-form
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: LoginForm) {
    try {
      const response = await axios.post("/api/admin/login", values);
      
      if (response.status === 200) {
        toast({
          title: "Login successful",
          description: "Redirecting to admin dashboard...",
        });
        setLocation("/admin/exchange-rates");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Gulf Rate Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">First time setup:</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={async () => {
                    try {
                      await axios.post("/api/admin/setup");
                      toast({
                        title: "Admin account created",
                        description: "Username: admin, Password: admin123",
                      });
                      form.setValue("username", "admin");
                      form.setValue("password", "admin123");
                    } catch (error) {
                      toast({
                        title: "Setup failed",
                        description: "Admin account may already exist",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Create Admin Account
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}