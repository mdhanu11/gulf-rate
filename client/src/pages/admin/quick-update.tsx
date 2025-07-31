import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/layout';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Save, 
  X, 
  Search
} from 'lucide-react';
import axios from 'axios';

interface Rate {
  id: number;
  providerKey: string;
  name: string;
  logo: string;
  logoText: string;
  logoColor: string;
  url: string;
  type: string;
  badge: string | null;
  rate: number;
  rateChange: number;
  fees: number;
  feeType: string;
  transferTime: string;
  rating: number;
  highlight: boolean;
  lastUpdated: string;
}

export default function QuickUpdate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{rate: string, fees: string}>({rate: '', fees: ''});

  // Fetch rates for Saudi Arabia and selected currency
  const { data: rates = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/exchange-rates', 'sa', selectedCurrency],
    queryFn: async () => {
      console.log('Fetching rates for currency:', selectedCurrency);
      const timestamp = Date.now();
      const response = await axios.get(`/api/exchange-rates/sa/${selectedCurrency}?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('Received rates:', response.data.rates?.length || 0);
      return response.data.rates || [];
    },
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for admin
  });

  // Update rate mutation
  const updateRateMutation = useMutation({
    mutationFn: async ({ id, rate, fees }: { id: number; rate: number; fees: number }) => {
      console.log(`[CLIENT] Updating rate ID ${id} with:`, { rate, fees });
      const response = await axios.patch(`/api/admin/exchange-rates/${id}`, {
        rate,
        fees,
      }, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(`[CLIENT] Update response:`, response.data);
      return response;
    },
    onSuccess: (response) => {
      console.log(`[CLIENT] Update successful:`, response.data);
      toast({
        title: "Rate updated successfully",
        description: "The exchange rate has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exchange-rates', 'sa', selectedCurrency] });
      setEditingId(null);
    },
    onError: (error: any) => {
      console.error(`[CLIENT] Update failed:`, error);
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Failed to update the exchange rate.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (rate: Rate) => {
    setEditingId(rate.id);
    setEditValues({
      rate: rate.rate.toString(),
      fees: rate.fees.toString(),
    });
  };

  const handleSave = () => {
    if (editingId && editValues.rate && editValues.fees) {
      updateRateMutation.mutate({
        id: editingId,
        rate: parseFloat(editValues.rate),
        fees: parseFloat(editValues.fees),
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({rate: '', fees: ''});
  };

  // Filter rates based on search
  const filteredRates = rates.filter((rate: Rate) =>
    rate.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) || false
  );

  const currencies = ['INR', 'BDT', 'PKR', 'PHP', 'NPR', 'LKR', 'EGP', 'EUR', 'GBP', 'USD'];

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quick Rate Update</h1>
            <p className="text-gray-600">Update SAR → {selectedCurrency} exchange rates</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Provider</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="currency">Currency</Label>
            <Select value={selectedCurrency} onValueChange={(value) => {
              setSelectedCurrency(value);
              // Clear search when currency changes
              setSearchQuery('');
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rates Grid */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRates.map((rate: Rate) => (
              <Card key={rate.id} className={`transition-all ${rate.highlight ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Provider Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center relative">
                        <img 
                          src={`${rate.logo}?v=${Date.now()}`} 
                          alt={rate.name}
                          className="w-8 h-8 object-contain rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                              fallback.textContent = rate.logoText || rate.name.charAt(0).toUpperCase();
                            }
                          }}
                        />
                        <span className="absolute inset-0 text-xs font-semibold text-gray-600 items-center justify-center hidden">
                          {rate.logoText || rate.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{rate.name}</h3>
                        <p className="text-sm text-gray-600">
                          SAR → {selectedCurrency} • {rate.type}
                        </p>
                      </div>
                    </div>

                    {/* Rate Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                      {editingId === rate.id ? (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <div className="space-y-1">
                            <Label className="text-xs">Rate</Label>
                            <Input
                              type="number"
                              step="0.001"
                              value={editValues.rate}
                              onChange={(e) => setEditValues(prev => ({...prev, rate: e.target.value}))}
                              className="w-24"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Fees</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editValues.fees}
                              onChange={(e) => setEditValues(prev => ({...prev, fees: e.target.value}))}
                              className="w-24"
                            />
                          </div>
                          <div className="flex gap-1 mt-6">
                            <Button size="sm" onClick={handleSave} disabled={updateRateMutation.isPending}>
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="text-right flex-1 sm:flex-initial">
                            <div className="text-lg font-bold">{rate.rate?.toFixed(3) || '0.000'}</div>
                            <div className="text-sm text-gray-600">
                              Fee: {rate.fees || 0} {rate.feeType === 'percentage' ? '%' : 'SAR'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {rate.rateChange !== 0 && (
                              <Badge variant={rate.rateChange > 0 ? "destructive" : "secondary"}>
                                {rate.rateChange > 0 ? (
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                )}
                                {Math.abs(rate.rateChange || 0).toFixed(3)}
                              </Badge>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(rate)}>
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                    <Badge variant="outline">{rate.transferTime}</Badge>
                    <Badge variant="outline">
                      ★ {rate.rating.toFixed(1)}
                    </Badge>
                    {rate.badge && (
                      <Badge variant="default">{rate.badge}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredRates.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No rates found for {selectedCurrency}.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}