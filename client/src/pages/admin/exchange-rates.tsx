import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/admin/layout";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

// Form schema for exchange rate update/creation
const rateSchema = z.object({
  providerId: z.coerce.number().positive("Please select a provider"),
  fromCurrency: z.string().min(3, "Currency code must be 3 characters").max(3, "Currency code must be 3 characters"),
  toCurrency: z.string().min(3, "Currency code must be 3 characters").max(3, "Currency code must be 3 characters"),
  rate: z.coerce.number().positive("Rate must be positive"),
  rateChange: z.coerce.number(),
  fees: z.coerce.number().min(0, "Fees cannot be negative"),
  feeType: z.string().min(1, "Fee type is required"),
  transferTime: z.string().min(1, "Transfer time is required"),
  rating: z.coerce.number().min(1, "Rating must be at least 1").max(5, "Rating cannot be greater than 5"),
  highlight: z.boolean().default(false),
});

type RateForm = z.infer<typeof rateSchema>;

export default function AdminExchangeRates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  
  // Fetch all providers
  const { data: providers = [] } = useQuery({
    queryKey: ["/api/admin/providers"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/providers");
      return response.data;
    }
  });
  
  // Fetch all exchange rates
  const { data: rates = [], isLoading } = useQuery({
    queryKey: ["/api/admin/exchange-rates"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/exchange-rates");
      return response.data;
    }
  });
  
  // Initialize form
  const form = useForm<RateForm>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      providerId: 0,
      fromCurrency: "SAR",
      toCurrency: "INR",
      rate: 0,
      rateChange: 0,
      fees: 0,
      feeType: "Fixed fee",
      transferTime: "1-2 days",
      rating: 4,
      highlight: false,
    },
  });
  
  // Mutation for updating an exchange rate
  const updateRateMutation = useMutation({
    mutationFn: async (data: RateForm) => {
      return axios.patch(`/api/admin/exchange-rates/${editingRateId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Rate updated",
        description: "The exchange rate has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/exchange-rates"] });
      setEditingRateId(null);
      form.reset({
        providerId: 0,
        fromCurrency: "SAR",
        toCurrency: "INR",
        rate: 0,
        rateChange: 0,
        fees: 0,
        feeType: "Fixed fee",
        transferTime: "1-2 days",
        rating: 4,
        highlight: false,
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating the exchange rate.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for creating a new exchange rate
  const createRateMutation = useMutation({
    mutationFn: async (data: RateForm) => {
      return axios.post("/api/admin/exchange-rates", data);
    },
    onSuccess: () => {
      toast({
        title: "Rate created",
        description: "The new exchange rate has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/exchange-rates"] });
      form.reset({
        providerId: 0,
        fromCurrency: "SAR",
        toCurrency: "INR",
        rate: 0,
        rateChange: 0,
        fees: 0,
        feeType: "Fixed fee",
        transferTime: "1-2 days",
        rating: 4,
        highlight: false,
      });
    },
    onError: () => {
      toast({
        title: "Creation failed",
        description: "There was an error creating the exchange rate.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission (create or update)
  function onSubmit(values: RateForm) {
    if (editingRateId) {
      updateRateMutation.mutate(values);
    } else {
      createRateMutation.mutate(values);
    }
  }
  
  // Load a rate for editing
  function editRate(rate: any) {
    setEditingRateId(rate.id);
    form.reset({
      providerId: rate.providerId,
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: parseFloat(rate.rate),
      rateChange: parseFloat(rate.rateChange),
      fees: parseFloat(rate.fees),
      feeType: rate.feeType,
      transferTime: rate.transferTime,
      rating: parseFloat(rate.rating),
      highlight: rate.highlight,
    });
  }
  
  // Cancel editing
  function cancelEdit() {
    setEditingRateId(null);
    form.reset({
      providerId: 0,
      fromCurrency: "SAR",
      toCurrency: "INR",
      rate: 0,
      rateChange: 0,
      fees: 0,
      feeType: "Fixed fee",
      transferTime: "1-2 days",
      rating: 4,
      highlight: false,
    });
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Manage Exchange Rates</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exchange Rates Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Exchange Rates</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center p-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <p className="mt-2 text-gray-600">Loading rates...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Provider</TableHead>
                          <TableHead>From/To</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Change</TableHead>
                          <TableHead>Fees</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rates?.length > 0 ? (
                          rates.map((rate: any) => (
                            <TableRow key={rate.id}>
                              <TableCell>{rate.provider?.name || 'Unknown'}</TableCell>
                              <TableCell>
                                {rate.fromCurrency} → {rate.toCurrency}
                              </TableCell>
                              <TableCell>{parseFloat(rate.rate).toFixed(4)}</TableCell>
                              <TableCell 
                                className={
                                  parseFloat(rate.rateChange) > 0 
                                    ? "text-green-600" 
                                    : parseFloat(rate.rateChange) < 0 
                                    ? "text-red-600" 
                                    : ""
                                }
                              >
                                {parseFloat(rate.rateChange) > 0 ? "+" : ""}
                                {parseFloat(rate.rateChange).toFixed(4)}
                              </TableCell>
                              <TableCell>
                                {parseFloat(rate.fees).toFixed(2)} ({rate.feeType})
                              </TableCell>
                              <TableCell>
                                {new Date(rate.lastUpdated).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => editRate(rate)}
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No exchange rates found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Form for creating/editing rates */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingRateId ? "Update Exchange Rate" : "Add New Rate"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="providerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider</FormLabel>
                          <Select 
                            value={field.value.toString()} 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {providers.map((provider: any) => (
                                <SelectItem key={provider.id} value={provider.id.toString()}>
                                  {provider.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fromCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Currency</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="SAR" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="toCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>To Currency</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="INR" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exchange Rate</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.0001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rateChange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate Change</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.0001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fees</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="feeType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fee Type</FormLabel>
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
                                <SelectItem value="Fixed fee">Fixed fee</SelectItem>
                                <SelectItem value="Variable fee">Variable fee</SelectItem>
                                <SelectItem value="No fee">No fee</SelectItem>
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
                        name="transferTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transfer Time</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="1-2 days" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating (1-5)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1" max="5" step="0.1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="highlight"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Highlight this rate</FormLabel>
                            <FormDescription>
                              The highlighted rate will be shown more prominently to users
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={updateRateMutation.isPending || createRateMutation.isPending}
                      >
                        {editingRateId ? "Update Rate" : "Add New Rate"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}