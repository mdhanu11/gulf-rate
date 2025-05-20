import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/layout";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

export default function BulkRateUpdate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState<string>("sa");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");
  const [updatedRates, setUpdatedRates] = useState<{[key: string]: any}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: async () => {
      const response = await axios.get("/api/countries");
      return response.data;
    }
  });

  // Fetch currencies for selected country
  const { data: currencies = [] } = useQuery({
    queryKey: ["/api/countries", selectedCountry, "currencies"],
    queryFn: async () => {
      const response = await axios.get(`/api/countries/${selectedCountry}/currencies`);
      return response.data;
    },
    enabled: !!selectedCountry
  });

  // Fetch exchange rates for selected currency
  const { data: exchangeRates = {}, isLoading } = useQuery({
    queryKey: ["/api/exchange-rates", selectedCountry, selectedCurrency],
    queryFn: async () => {
      const response = await axios.get(`/api/exchange-rates/${selectedCountry}/${selectedCurrency}`);
      return response.data;
    },
    enabled: !!selectedCountry && !!selectedCurrency
  });

  // Mutation to update rates
  const updateRatesMutation = useMutation({
    mutationFn: async (data: {rates: any[]}) => {
      return axios.post("/api/admin/bulk-update-rates", data);
    },
    onSuccess: () => {
      toast({
        title: "Rates updated",
        description: "Exchange rates have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/exchange-rates"] });
      setUpdatedRates({});
      setIsSubmitting(false);
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating the exchange rates.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Handle field change
  const handleRateChange = (providerId: number, field: string, value: any) => {
    setUpdatedRates(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [field]: value
      }
    }));
  };

  // Submit all changes
  const submitChanges = async () => {
    setIsSubmitting(true);
    
    // Convert the object to array format for submission
    const updatedRatesArray = Object.keys(updatedRates).map(providerId => ({
      providerId: parseInt(providerId),
      countryCode: selectedCountry,
      toCurrency: selectedCurrency,
      ...updatedRates[providerId]
    })).filter(rate => Object.keys(rate).length > 3); // Only send rates with actual changes
    
    if (updatedRatesArray.length === 0) {
      toast({
        title: "No changes",
        description: "No rates have been modified.",
      });
      setIsSubmitting(false);
      return;
    }
    
    updateRatesMutation.mutate({ rates: updatedRatesArray });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Bulk Update Exchange Rates</h1>
        
        <div className="flex flex-col gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Select Country and Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="w-full md:w-auto">
                  <label className="block mb-2 text-sm font-medium">Country</label>
                  <Select 
                    value={selectedCountry} 
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country: any) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-auto">
                  <label className="block mb-2 text-sm font-medium">Currency</label>
                  <Select 
                    value={selectedCurrency} 
                    onValueChange={setSelectedCurrency}
                  >
                    <SelectTrigger className="w-[200px]">
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
              </div>
            </CardContent>
          </Card>
          
          {/* Rates Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Exchange Rates: {selectedCountry.toUpperCase()} → {selectedCurrency}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <p className="mt-2 text-gray-600">Loading rates...</p>
                </div>
              ) : exchangeRates.rates && exchangeRates.rates.length > 0 ? (
                <div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Provider</TableHead>
                          <TableHead>Current Rate</TableHead>
                          <TableHead>New Rate</TableHead>
                          <TableHead>Current Fees</TableHead>
                          <TableHead>New Fees</TableHead>
                          <TableHead>Fee Type</TableHead>
                          <TableHead>Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exchangeRates.rates.map((rate: any) => (
                          <TableRow key={rate.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {rate.logo && (
                                  <div className="h-8 w-8 flex-shrink-0">
                                    <img 
                                      src={rate.logo.startsWith('http') 
                                        ? rate.logo 
                                        : `/images/providers/${rate.providerKey}.jpeg`}
                                      alt={rate.name}
                                      className="h-full w-full object-contain"
                                      onError={(e) => {
                                        const target = e.currentTarget;
                                        target.onerror = null;
                                        
                                        // Try different formats
                                        if (target.src.includes('.jpeg')) {
                                          target.src = `/images/providers/${rate.providerKey}.png`;
                                        } else if (target.src.includes('.png')) {
                                          target.src = `/images/providers/${rate.providerKey}.svg`;
                                        } else {
                                          target.style.display = "none";
                                        }
                                      }}
                                    />
                                  </div>
                                )}
                                <span>{rate.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{parseFloat(rate.rate).toFixed(4)}</TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                step="0.0001"
                                placeholder={parseFloat(rate.rate).toFixed(4)}
                                value={updatedRates[rate.id]?.rate || ""}
                                onChange={(e) => handleRateChange(rate.id, "rate", parseFloat(e.target.value))}
                                className="w-28"
                              />
                            </TableCell>
                            <TableCell>{parseFloat(rate.fees).toFixed(2)}</TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder={parseFloat(rate.fees).toFixed(2)}
                                value={updatedRates[rate.id]?.fees || ""}
                                onChange={(e) => handleRateChange(rate.id, "fees", parseFloat(e.target.value))}
                                className="w-28"
                              />
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={updatedRates[rate.id]?.feeType || rate.feeType} 
                                onValueChange={(value) => handleRateChange(rate.id, "feeType", value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Fixed fee">Fixed fee</SelectItem>
                                  <SelectItem value="Variable fee">Variable fee</SelectItem>
                                  <SelectItem value="No fee">No fee</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {new Date(rate.lastUpdated).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={submitChanges}
                      disabled={isSubmitting || Object.keys(updatedRates).length === 0}
                      className="w-36"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Rates'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No exchange rates found for this currency</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}