import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/layout";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AccessDenied from "./access-denied";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

// Form schema for provider
const providerSchema = z.object({
  providerKey: z.string().min(2, "Provider key must be at least 2 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  logo: z.string().nullable(),
  logoText: z.string().nullable(),
  logoColor: z.string().nullable(),
  url: z.string().url("Must be a valid URL"),
  type: z.string().min(1, "Type is required"),
  badge: z.string().nullable(),
  active: z.boolean().default(true),
  countryCode: z.string().min(2, "Country code must be at least 2 characters"),
  sortOrder: z.coerce.number().nullable(),
});

type ProviderForm = z.infer<typeof providerSchema>;

export default function AdminProviders() {
  const { toast } = useToast();
  const { admin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<number | null>(null);
  
  // Check if user has admin privileges
  if (admin?.role !== 'admin') {
    return <AccessDenied />;
  }
  
  // Fetch all providers
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/admin/providers"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/providers");
      return response.data;
    }
  });
  
  // Fetch all countries
  const { data: countries = [] } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: async () => {
      const response = await axios.get("/api/countries");
      return response.data;
    }
  });
  
  // Initialize form
  const form = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      providerKey: "",
      name: "",
      logo: "",
      logoText: "",
      logoColor: "primary",
      url: "",
      type: "Bank Transfer",
      badge: null,
      active: true,
      countryCode: "sa",
      sortOrder: null,
    },
  });
  
  // Mutation for creating a new provider
  const createProviderMutation = useMutation({
    mutationFn: async (data: ProviderForm) => {
      return axios.post("/api/admin/providers", data);
    },
    onSuccess: () => {
      toast({
        title: "Provider created",
        description: "The provider has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.response?.data?.message || "There was an error creating the provider.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating a provider
  const updateProviderMutation = useMutation({
    mutationFn: async (data: ProviderForm & { id: number }) => {
      return axios.patch(`/api/admin/providers/${data.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Provider updated",
        description: "The provider has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
      setIsDialogOpen(false);
      setEditingProviderId(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "There was an error updating the provider.",
        variant: "destructive",
      });
    },
  });
  
  // Reset form to default values
  const resetForm = () => {
    form.reset({
      providerKey: "",
      name: "",
      logo: "",
      logoText: "",
      logoColor: "primary",
      url: "",
      type: "Bank Transfer",
      badge: null,
      active: true,
      countryCode: "sa",
      sortOrder: null,
    });
  };
  
  // Open dialog for creating a new provider
  const openCreateDialog = () => {
    resetForm();
    setEditingProviderId(null);
    setIsDialogOpen(true);
  };
  
  // Open dialog for editing a provider
  const openEditDialog = (provider: any) => {
    form.reset({
      providerKey: provider.providerKey,
      name: provider.name,
      logo: provider.logo || "",
      logoText: provider.logoText || "",
      logoColor: provider.logoColor || "primary",
      url: provider.url,
      type: provider.type,
      badge: provider.badge || "",
      active: provider.active,
      countryCode: provider.countryCode,
      sortOrder: provider.sortOrder,
    });
    setEditingProviderId(provider.id);
    setIsDialogOpen(true);
  };
  
  // Handle form submission
  const onSubmit = (values: ProviderForm) => {
    // Clean up empty string values to be null
    const formData = {
      ...values,
      logo: values.logo || null,
      logoText: values.logoText || null,
      logoColor: values.logoColor || null,
      badge: values.badge || null,
    };
    
    if (editingProviderId) {
      updateProviderMutation.mutate({ id: editingProviderId, ...formData });
    } else {
      createProviderMutation.mutate(formData);
    }
  };
  
  // Toggle provider active status
  const toggleProviderActive = async (provider: any) => {
    try {
      await axios.patch(`/api/admin/providers/${provider.id}`, {
        active: !provider.active
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
      
      toast({
        title: `Provider ${provider.active ? 'deactivated' : 'activated'}`,
        description: `${provider.name} has been ${provider.active ? 'deactivated' : 'activated'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.response?.data?.message || "There was an error updating the provider.",
        variant: "destructive",
      });
    }
  };
  
  // Provider type options
  const providerTypes = [
    "Bank Transfer",
    "Digital Transfer",
    "Digital Wallet",
    "Mobile Wallet",
    "Cash Pickup"
  ];
  
  // Logo color options
  const logoColors = [
    "primary",
    "green",
    "blue",
    "yellow",
    "red",
    "orange",
    "purple",
    "pink",
    "indigo",
    "teal"
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Providers</h1>
          <Button onClick={openCreateDialog}>Add New Provider</Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Provider List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-2 text-gray-600">Loading providers...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logo</TableHead>
                      <TableHead>Provider Key</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.length > 0 ? (
                      providers.map((provider: any) => (
                        <TableRow key={provider.id} className={!provider.active ? "bg-gray-50" : ""}>
                          <TableCell>
                            <div className="h-10 w-10 flex items-center justify-center rounded-md overflow-hidden">
                              {provider.logo ? (
                                <img 
                                  src={provider.logo.startsWith('http') 
                                    ? provider.logo 
                                    : `/images/providers/${provider.providerKey}.jpeg`}
                                  alt={provider.name}
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.onerror = null;
                                    
                                    // Try different formats
                                    if (target.src.includes('.jpeg')) {
                                      target.src = `/images/providers/${provider.providerKey}.png`;
                                    } else if (target.src.includes('.png')) {
                                      target.src = `/images/providers/${provider.providerKey}.svg`;
                                    } else {
                                      target.style.display = "none";
                                      target.parentElement!.style.backgroundColor = getColorHex(provider.logoColor || "primary");
                                      target.parentElement!.innerHTML = `
                                        <span class="text-white font-bold text-sm">
                                          ${provider.logoText || provider.name.substring(0, 2).toUpperCase()}
                                        </span>
                                      `;
                                    }
                                  }}
                                />
                              ) : (
                                <div 
                                  className="h-full w-full flex items-center justify-center"
                                  style={{ backgroundColor: getColorHex(provider.logoColor || "primary") }}
                                >
                                  <span className="text-white font-bold text-sm">
                                    {provider.logoText || provider.name.substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{provider.providerKey}</TableCell>
                          <TableCell className="font-medium">{provider.name}</TableCell>
                          <TableCell>{provider.type}</TableCell>
                          <TableCell>{provider.countryCode.toUpperCase()}</TableCell>
                          <TableCell>
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                provider.active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {provider.active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openEditDialog(provider)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant={provider.active ? "destructive" : "default"}
                                size="sm"
                                onClick={() => toggleProviderActive(provider)}
                              >
                                {provider.active ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No providers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Provider Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProviderId ? "Edit Provider" : "Add New Provider"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="providerKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Key</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., stc, alrajhi, wu" 
                            disabled={!!editingProviderId}
                          />
                        </FormControl>
                        <FormDescription>
                          Unique identifier, used for image filenames
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="STC Bank" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="https://example.com/logo.png" />
                        </FormControl>
                        <FormDescription>
                          Leave empty to use /images/providers/{form.watch('providerKey')}.jpeg
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="badge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Badge (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Best Rate" 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="logoText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo Text (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="STC" 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Text to show when logo is unavailable
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="logoColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo Color</FormLabel>
                        <Select 
                          value={field.value || "primary"} 
                          onValueChange={(value) => field.onChange(value || "primary")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {logoColors.map((color) => (
                              <SelectItem key={color} value={color}>
                                <div className="flex items-center">
                                  <div 
                                    className="w-4 h-4 rounded-full mr-2" 
                                    style={{ backgroundColor: getColorHex(color) }}
                                  ></div>
                                  <span className="capitalize">{color}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Type</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providerTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country: any) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Lower numbers appear first
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <div className="flex items-center space-x-2 mt-8">
                          <input
                            type="checkbox"
                            id="active-checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label htmlFor="active-checkbox" className="text-sm font-medium text-gray-700">
                            Provider is active
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={
                      createProviderMutation.isPending || 
                      updateProviderMutation.isPending
                    }
                  >
                    {createProviderMutation.isPending || updateProviderMutation.isPending 
                      ? 'Saving...' 
                      : editingProviderId 
                        ? 'Update Provider' 
                        : 'Add Provider'
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

// Helper function to get color hex from name
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    primary: "#4F46E5",
    green: "#10B981",
    blue: "#3B82F6",
    yellow: "#F59E0B",
    red: "#EF4444",
    orange: "#F97316",
    purple: "#8B5CF6",
    pink: "#EC4899",
    indigo: "#6366F1",
    teal: "#14B8A6"
  };
  
  return colorMap[color] || colorMap.primary;
}