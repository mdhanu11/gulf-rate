import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';

interface Rate {
  id: number;
  providerId: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateChange: number;
  fees: number;
  feeType: string;
}

interface Provider {
  id: number;
  name: string;
  providerKey: string;
  logo: string | null;
}

export default function QuickUpdate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [editedRates, setEditedRates] = useState<Record<number, { rate: string; fees: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRate, setNewRate] = useState({
    providerId: 0,
    rate: '',
    fees: '',
    feeType: 'fixed_fee',
  });

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ['/api/countries'],
    queryFn: async () => {
      const response = await axios.get('/api/countries');
      return response.data;
    },
  });

  // Fetch currencies
  const { data: currencies = [] } = useQuery({
    queryKey: ['/api/countries/sa/currencies'],
    queryFn: async () => {
      const response = await axios.get('/api/countries/sa/currencies');
      return response.data;
    },
  });

  // Fetch providers
  const { data: providers = [] } = useQuery({
    queryKey: ['/api/admin/providers'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/providers');
      return response.data;
    },
  });

  // Fetch exchange rates
  const { data: rates = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/exchange-rates/sa', selectedCurrency],
    queryFn: async () => {
      const response = await axios.get(`/api/exchange-rates/sa/${selectedCurrency}`);
      // Ensure each rate has the corresponding provider information
      if (response.data.rates && response.data.rates.length > 0) {
        // Return rates with more complete provider information
        return response.data.rates.map((rate: any) => {
          // Find the provider by id or key if available
          const provider = providers.find((p: any) => 
            p.id === rate.providerId || p.providerKey === rate.providerKey
          );
          return {
            ...rate,
            provider: provider || { name: rate.providerKey || 'Unknown Provider' }
          };
        });
      }
      return response.data.rates || [];
    },
    enabled: providers.length > 0, // Only run this query when providers are loaded
    refetchInterval: 5000, // Automatically refresh rates every 5 seconds when on this page
    staleTime: 0, // Always consider data stale and refetch on component mount
  });

  // Update when currency changes
  useEffect(() => {
    // Reset edited rates when currency changes
    setEditedRates({});
  }, [selectedCurrency]);

  // Handle rate or fee change
  const handleChange = (id: number, field: 'rate' | 'fees', value: string) => {
    setEditedRates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Update rates mutation - fixed version with better response handling
  const updateRatesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/api/admin/bulk-update-rates', { rates: data });
      console.log('Update response:', response.data);
      return response;
    },
    onSuccess: (response) => {
      // Extract data from response
      const data = response.data;
      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      
      toast({
        title: 'Rates updated',
        description: `${successCount} exchange rates have been updated successfully`,
      });
      
      // Clear edited rates and reset submission state
      setEditedRates({});
      setIsSubmitting(false);
      
      // Force immediate invalidation of queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/exchange-rates/sa', selectedCurrency],
        exact: true,
        refetchType: 'all' 
      });
      
      // Force immediate refetch with zero delay
      refetch();
      
      // Refetch again after a short delay to ensure DB consistency
      setTimeout(() => {
        console.log('Performing additional refetch to ensure data consistency');
        refetch();
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Failed to update rates',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });
  
  // Add new rate mutation
  const addRateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await axios.post('/api/admin/exchange-rates', data);
    },
    onSuccess: () => {
      toast({
        title: 'Rate added',
        description: 'New exchange rate has been added successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exchange-rates'] });
      // Reset the form
      setNewRate({
        providerId: 0,
        rate: '',
        fees: '',
        feeType: 'fixed_fee',
      });
      // Close the dialog
      const closeButton = document.querySelector('[data-state="open"] [data-dialogclose]');
      if (closeButton) {
        (closeButton as HTMLElement).click();
      }
      // Refresh the data
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add rate',
        description: error.response?.data?.message || 'Could not add new exchange rate',
        variant: 'destructive',
      });
    },
  });

  // Submit changes - debuggable version with better error handling
  const submitChanges = () => {
    const hasChanges = Object.keys(editedRates).length > 0;
    
    if (!hasChanges) {
      toast({
        title: 'No changes',
        description: 'No changes to submit',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create simpler update objects with only the necessary fields for the database update
      const updatesToSubmit = Object.entries(editedRates).map(([id, changes]) => {
        const rateId = parseInt(id);
        const currentRate = rates.find((r: any) => r.id === rateId);
        
        if (!currentRate) {
          console.error(`Could not find rate with ID ${rateId}`);
          return null;
        }
        
        // Create a simplified update object with ID and only changed fields
        const updateObj: any = {
          id: rateId
        };
        
        // Only include rate if it was changed
        if (changes.rate && changes.rate.trim() !== '') {
          const parsedRate = parseFloat(changes.rate);
          if (!isNaN(parsedRate)) {
            updateObj.rate = parsedRate;
            console.log(`Will update rate ID ${rateId} with new rate: ${parsedRate}`);
          } else {
            console.error(`Invalid rate value: "${changes.rate}"`);
          }
        }
        
        // Only include fees if it was changed
        if (changes.fees && changes.fees.trim() !== '') {
          const parsedFees = parseFloat(changes.fees);
          if (!isNaN(parsedFees)) {
            updateObj.fees = parsedFees;
            console.log(`Will update rate ID ${rateId} with new fees: ${parsedFees}`);
          } else {
            console.error(`Invalid fees value: "${changes.fees}"`);
          }
        }
        
        return updateObj;
      }).filter(update => update !== null);
      
      // Check if any valid updates remain after filtering
      if (updatesToSubmit.length === 0) {
        toast({
          title: 'No valid changes',
          description: 'No valid changes to submit',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }
      
      // Log what we're sending to the server
      console.log('Sending updates to server:', JSON.stringify(updatesToSubmit));
      
      // Send update to server
      updateRatesMutation.mutate(updatesToSubmit);
      
    } catch (error) {
      console.error('Error preparing rate updates:', error);
      toast({
        title: 'Update preparation failed',
        description: 'An error occurred while preparing the updates',
        variant: 'destructive'
      });
      setIsSubmitting(false);
    }
  };

  // Get provider name by ID
  const getProviderName = (providerId: number, providerKey: string) => {
    const provider = providers.find((p: any) => p.id === providerId);
    if (provider?.name) {
      return provider.name;
    }
    
    // If provider not found by ID, try to find by providerKey
    const providerByKey = providers.find((p: any) => p.providerKey === providerKey);
    if (providerByKey?.name) {
      return providerByKey.name;
    }
    
    // Use providerKey as fallback if both lookups fail
    return providerKey || 'Unknown Provider';
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Quick Rate Update</h1>
        
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Currency</CardTitle>
              <CardDescription>Update rates for your selected currency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/3">
                  <Select 
                    value={selectedCurrency}
                    onValueChange={setSelectedCurrency}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency: string) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()}
                  className="flex items-center gap-2"
                >
                  <span>Refresh Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Update Exchange Rates ({selectedCurrency})</CardTitle>
              <CardDescription>
                Edit rates and fees directly in the table
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Rate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Exchange Rate</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select 
                      value={newRate.providerId.toString()} 
                      onValueChange={(value) => setNewRate({...newRate, providerId: parseInt(value)})}
                    >
                      <SelectTrigger id="provider">
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider: any) => (
                          <SelectItem key={provider.id} value={provider.id.toString()}>
                            {provider.name || provider.providerKey}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="rate">Rate</Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.0001"
                        placeholder="22.5000"
                        value={newRate.rate}
                        onChange={(e) => setNewRate({...newRate, rate: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fees">Fees</Label>
                      <Input
                        id="fees"
                        type="number"
                        step="0.01"
                        placeholder="15.00"
                        value={newRate.fees}
                        onChange={(e) => setNewRate({...newRate, fees: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="feeType">Fee Type</Label>
                    <Select 
                      value={newRate.feeType} 
                      onValueChange={(value) => setNewRate({...newRate, feeType: value})}
                    >
                      <SelectTrigger id="feeType">
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed_fee">Fixed Fee</SelectItem>
                        <SelectItem value="variable_fee">Variable Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => {
                      if (newRate.providerId && newRate.rate && newRate.fees) {
                        addRateMutation.mutate({
                          providerId: newRate.providerId,
                          countryCode: 'sa',
                          fromCurrency: 'SAR',
                          toCurrency: selectedCurrency,
                          rate: parseFloat(newRate.rate),
                          fees: parseFloat(newRate.fees),
                          feeType: newRate.feeType,
                          transferTime: '1-2 days',
                          rateChange: 0,
                          rating: 4.0
                        });
                      } else {
                        toast({
                          title: 'Missing information',
                          description: 'Please fill all required fields',
                          variant: 'destructive'
                        });
                      }
                    }}
                  >
                    Add Exchange Rate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading rates...</span>
              </div>
            ) : rates.length > 0 ? (
              <>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Current Rate</TableHead>
                        <TableHead>New Rate</TableHead>
                        <TableHead>Current Fees</TableHead>
                        <TableHead>New Fees</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rates.map((rate: any) => (
                        <TableRow key={rate.id}>
                          <TableCell>
                            <div className="font-medium">
                              {rate.provider?.name || rate.providerKey || 'Unknown Provider'}
                            </div>
                            <div className="text-sm text-gray-500">
                              SAR → {selectedCurrency}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">
                            {parseFloat(rate.rate).toFixed(4)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.0001"
                              placeholder={parseFloat(rate.rate).toFixed(4)}
                              value={editedRates[rate.id]?.rate || ''}
                              onChange={(e) => handleChange(rate.id, 'rate', e.target.value)}
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell className="font-mono">
                            {parseFloat(rate.fees).toFixed(2)} ({rate.feeType})
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={parseFloat(rate.fees).toFixed(2)}
                              value={editedRates[rate.id]?.fees || ''}
                              onChange={(e) => handleChange(rate.id, 'fees', e.target.value)}
                              className="w-32"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={submitChanges}
                    disabled={isSubmitting || Object.keys(editedRates).length === 0}
                    className="w-36"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Rates'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-gray-500">
                No exchange rates found for {selectedCurrency}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}