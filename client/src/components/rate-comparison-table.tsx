import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useExchangeRates } from '@/hooks/use-exchange-rates';

interface SortOption {
  key: 'rate' | 'fees' | 'rating';
  direction: 'asc' | 'desc';
  label: string;
  icon: string;
}

const RateComparisonTable: React.FC<{ countryCode: string }> = ({ countryCode }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(1000);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('INR');
  const [sortOption, setSortOption] = useState<SortOption>({
    key: 'rate',
    direction: 'desc',
    label: t('rateTable.sortOptions.bestRate'),
    icon: 'fa-sort-amount-up'
  });
  
  // Fetch exchange rates using our custom hook
  const { 
    data: exchangeRates, 
    isLoading, 
    isError, 
    refetch,
    lastUpdated 
  } = useExchangeRates(countryCode, selectedCurrency);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };
  
  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
  };
  
  const handleSort = (option: SortOption) => {
    setSortOption(option);
  };
  
  const handleUpdateResults = () => {
    refetch();
  };
  
  // Format the last updated timestamp
  const formattedLastUpdated = lastUpdated 
    ? new Date(lastUpdated).toLocaleString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' (Saudi Time)'
    : '';
  
  // Sort options array
  const sortOptions: SortOption[] = [
    { key: 'rate', direction: 'desc', label: t('rateTable.sortOptions.bestRate'), icon: 'fa-sort-amount-up' },
    { key: 'fees', direction: 'asc', label: t('rateTable.sortOptions.lowestFees'), icon: 'fa-tags' },
    { key: 'rating', direction: 'desc', label: t('rateTable.sortOptions.userRating'), icon: 'fa-star' }
  ];
  
  // Sort the exchange rates based on the selected sort option
  const sortedRates = exchangeRates ? [...exchangeRates].sort((a, b) => {
    if (sortOption.key === 'rate') {
      return sortOption.direction === 'desc' 
        ? b.rate - a.rate 
        : a.rate - b.rate;
    } else if (sortOption.key === 'fees') {
      return sortOption.direction === 'asc' 
        ? (a.fees === 0 ? -1 : (b.fees === 0 ? 1 : a.fees - b.fees))
        : (b.fees === 0 ? -1 : (a.fees === 0 ? 1 : b.fees - a.fees));
    } else {
      // Rating
      return sortOption.direction === 'desc' 
        ? b.rating - a.rating 
        : a.rating - b.rating;
    }
  }) : [];
  
  // Currency options
  const currencyOptions = [
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'PKR', label: 'PKR - Pakistani Rupee' },
    { value: 'PHP', label: 'PHP - Philippine Peso' },
    { value: 'BDT', label: 'BDT - Bangladeshi Taka' },
    { value: 'NPR', label: 'NPR - Nepalese Rupee' },
    { value: 'EGP', label: 'EGP - Egyptian Pound' },
    { value: 'LKR', label: 'LKR - Sri Lankan Rupee' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'EUR', label: 'EUR - Euro' }
  ];
  
  // Generate rating stars
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star text-secondary-500"></i>);
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-secondary-500"></i>);
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-secondary-500"></i>);
    }
    
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  const [showAllProviders, setShowAllProviders] = useState(false);
  const displayedProviders = showAllProviders ? sortedRates : sortedRates.slice(0, 5);

  return (
    <section id="compare" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-inter">
            {t('rateTable.title', { country: t(`countries.${countryCode}`) })}
          </h2>
          <p className="mt-3 text-gray-600">
            {t('rateTable.subtitle')}
          </p>
        </div>
        
        {/* Currency and Amount Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                {t('rateTable.filter.amount')}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  min={0}
                  onChange={handleAmountChange}
                  className="pl-16"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 font-medium">SAR</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                {t('rateTable.filter.currency')}
              </label>
              <Select
                value={selectedCurrency}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('rateTable.filter.selectCurrency')} />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Button 
                className="w-full md:w-auto"
                onClick={handleUpdateResults}
              >
                {t('rateTable.filter.button')}
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Table Sorting Options */}
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="text-sm text-gray-600 mb-2 md:mb-0">
            <i className="fas fa-sync-alt mr-1"></i> {t('rateTable.lastUpdated')}: {formattedLastUpdated}
          </div>
          
          <div className="flex space-x-2">
            <span className="text-sm text-gray-600 mr-2 self-center">{t('rateTable.sortBy')}:</span>
            {sortOptions.map(option => (
              <Button
                key={option.key}
                variant={sortOption.key === option.key ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort(option)}
                className="text-sm px-3 py-1 h-auto"
              >
                <i className={`fas ${option.icon} mr-1`}></i> {option.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Rate Comparison Table */}
        <Card className="mb-8 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <i className="fas fa-spinner fa-spin text-2xl text-primary-500 mb-2"></i>
                <p>{t('common.loading')}</p>
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-error">
                <i className="fas fa-exclamation-circle text-2xl mb-2"></i>
                <p>{t('common.error')}</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-2">
                  {t('common.tryAgain')}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>{t('rateTable.columns.provider')}</TableHead>
                    <TableHead>{t('rateTable.columns.rate')}</TableHead>
                    <TableHead>{t('rateTable.columns.youGet')}</TableHead>
                    <TableHead>{t('rateTable.columns.fees')}</TableHead>
                    <TableHead>{t('rateTable.columns.transferTime')}</TableHead>
                    <TableHead>{t('rateTable.columns.rating')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedProviders.map((provider) => (
                    <TableRow key={provider.id} className={`hover:bg-gray-50 ${provider.highlight ? 'bg-green-50' : ''}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {provider.logo ? (
                              <div 
                                className={`h-10 w-10 rounded-md flex items-center justify-center p-1 shadow-sm overflow-hidden 
                                  bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200`}
                                style={{ 
                                  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                              >
                                <img 
                                  className="max-h-full max-w-full object-contain" 
                                  src={provider.logo} 
                                  alt={`${provider.name} logo`}
                                  loading="eager"
                                  onError={(e) => {
                                    // Fall back to text logo on image load error
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.classList.add(`bg-${provider.logoColor || 'primary'}-100`);
                                      parent.classList.add('flex', 'items-center', 'justify-center');
                                      const logoText = provider.logoText || provider.name.substring(0, 2).toUpperCase();
                                      parent.innerHTML = `<span class="text-${provider.logoColor || 'primary'}-600 font-bold text-sm">${logoText}</span>`;
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div 
                                className={`h-10 w-10 rounded-md bg-${provider.logoColor || 'primary'}-100 flex items-center justify-center text-${provider.logoColor || 'primary'}-600 font-bold text-sm`}
                              >
                                {provider.logoText || provider.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {provider.name}
                              {provider.badge && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {provider.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{provider.type}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          1 SAR = {provider.rate.toFixed(2)} {selectedCurrency}
                        </div>
                        <div className={`text-xs font-medium ${
                          provider.rateChange > 0 
                            ? 'text-success-500' 
                            : provider.rateChange < 0 
                              ? 'text-error-500' 
                              : 'text-gray-500'
                        }`}>
                          <i className={`fas ${
                            provider.rateChange > 0 
                              ? 'fa-arrow-up' 
                              : provider.rateChange < 0 
                                ? 'fa-arrow-down' 
                                : 'fa-minus'
                          }`}></i> {Math.abs(provider.rateChange).toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          {(amount * provider.rate).toLocaleString()} {selectedCurrency}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('rateTable.for')} {amount.toLocaleString()} SAR
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {provider.fees === 0 ? t('common.free') : `${provider.fees} SAR`}
                        </div>
                        <div className="text-xs text-gray-500">{provider.feeType}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">{provider.transferTime}</div>
                      </TableCell>
                      <TableCell>
                        {renderRatingStars(provider.rating)}
                      </TableCell>
                      <TableCell className="text-right">
                        <a 
                          href={provider.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          {t('rateTable.transfer')} <i className="fas fa-external-link-alt ml-1 text-xs"></i>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
        
        {/* View More Button */}
        {sortedRates.length > 5 && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAllProviders(!showAllProviders)}
              className="inline-flex items-center"
            >
              {showAllProviders ? t('rateTable.viewLess') : t('rateTable.viewMore', { count: sortedRates.length })}
              <i className={`fas fa-chevron-${showAllProviders ? 'up' : 'down'} ml-2`}></i>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RateComparisonTable;
