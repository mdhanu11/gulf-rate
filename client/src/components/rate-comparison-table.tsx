import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalizedProviderNames } from "@/hooks/use-localized-provider-names";
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
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { useAvailableCurrencies, type CurrencyOption } from "@/hooks/use-currencies";

interface SortOption {
  key: "rate" | "fees" | "rating";
  direction: "asc" | "desc";
  label: string;
  icon: string;
}

// Define a local interface that matches the actual API response
interface ProviderWithRate {
  id: number;
  providerKey: string;
  name: string;
  logo: string | null;
  logoText: string | null;
  logoColor: string | null;
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
  active?: boolean | null;
  sortOrder?: number | null;
  lastUpdated: string | Date;
}

const RateComparisonTable: React.FC<{ countryCode: string }> = ({
  countryCode,
}) => {
  const { t } = useTranslation();
  const { getLocalizedName } = useLocalizedProviderNames();
  const [amount, setAmount] = useState<number>(1000);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");
  const [sortOption, setSortOption] = useState<SortOption>({
    key: "rate",
    direction: "desc",
    label: t("rateTable.sortOptions.bestRate"),
    icon: "fa-sort-amount-up",
  });

  // Fetch exchange rates using our custom hook
  const {
    data: exchangeRates,
    isLoading,
    isError,
    refetch,
    lastUpdated,
  } = useExchangeRates(countryCode, selectedCurrency);

  // Sort options for the rate comparison table - using translated labels
  const sortOptions: SortOption[] = [
    {
      key: "rate",
      direction: "desc",
      label: t("rateTable.sortOptions.bestRate"),
      icon: "sort-asc", // Just a reference identifier for path selection
    },
    {
      key: "fees",
      direction: "asc",
      label: t("rateTable.sortOptions.lowestFees"),
      icon: "sort-desc", // Just a reference identifier for path selection
    },
    {
      key: "rating",
      direction: "desc",
      label: t("rateTable.sortOptions.highestRated"),
      icon: "star", // Just a reference identifier for path selection
    },
  ];
  
  // Update sort options when language changes
  useEffect(() => {
    setSortOption(prev => ({
      ...prev,
      label: t(`rateTable.sortOptions.${prev.key === 'rate' ? 'bestRate' : prev.key === 'fees' ? 'lowestFees' : 'highestRated'}`)
    }));
  }, [t]);

  // Get currencies from database using our hook
  const { currencyOptions, isLoading: isLoadingCurrencies } = useAvailableCurrencies(countryCode);
  
  // Fallback to common currencies when data is loading or no currencies are returned from API
  const currencies = currencyOptions.length > 0 ? currencyOptions : [
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "PKR", label: "PKR - Pakistani Rupee" },
    { value: "PHP", label: "PHP - Philippine Peso" },
    { value: "BDT", label: "BDT - Bangladeshi Taka" },
    { value: "NPR", label: "NPR - Nepalese Rupee" },
  ];

  // Handle sorting of providers based on the selected sort option
  const handleSort = (option: SortOption) => {
    setSortOption(option);
  };

  // Color mapping for provider logos
  const colorMap: Record<string, string> = {
    primary: "#0072C6",
    blue: "#0072C6",
    green: "#28a745",
    yellow: "#ffc107",
    orange: "#fd7e14",
    purple: "#6f42c1",
    indigo: "#6610f2",
    teal: "#20c997",
    red: "#dc3545",
    pink: "#e83e8c",
    default: "#0072C6",
  };

  // Helper to get the accent color for provider logo backgrounds
  const getAccentColor = (logoColor: string): string => {
    return colorMap[logoColor] || colorMap.default;
  };

  // Handle changing the currency selection
  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    
    // Track currency change in analytics
    if (window.gtag) {
      window.gtag('event', 'currency_change', {
        event_category: 'filters',
        event_label: currency
      });
    }
  };

  // Determine which rates to display based on sorting
  const sortedRates = exchangeRates
    ? [...exchangeRates].sort((a: any, b: any) => {
        if (sortOption.key === "rate") {
          return sortOption.direction === "desc"
            ? b.rate - a.rate
            : a.rate - b.rate;
        } else if (sortOption.key === "fees") {
          return sortOption.direction === "desc"
            ? b.fees - a.fees
            : a.fees - b.fees;
        } else {
          // rating
          return sortOption.direction === "desc"
            ? b.rating - a.rating
            : a.rating - b.rating;
        }
      })
    : [];

  // Helper to render the fee display
  const renderFees = (provider: ProviderWithRate) => {
    if (provider.fees === 0) {
      return (
        <span className="text-success-500 font-semibold">
          {t("rateTable.noFees")}
        </span>
      );
    } else if (provider.feeType && provider.feeType.includes("Fixed")) {
      return (
        <span>
          {provider.fees} {t("rateTable.sar")} ({t("rateTable.feeTypes.fixed")})
        </span>
      );
    } else if (provider.feeType && provider.feeType.includes("Variable")) {
      return (
        <span>
          {provider.fees} {t("rateTable.sar")} ({t("rateTable.feeTypes.variable")}, {(provider.fees / amount * 100).toFixed(1)}%)
        </span>
      );
    } else {
      return (
        <span>
          {provider.fees} {t("rateTable.sar")}
        </span>
      );
    }
  };

  // Helper to render star ratings
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <i key={i} className="fas fa-star text-yellow-400"></i>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <i key={i} className="fas fa-star-half-alt text-yellow-400"></i>
        );
      } else {
        stars.push(
          <i key={i} className="far fa-star text-gray-300"></i>
        );
      }
    }

    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const [showAllProviders, setShowAllProviders] = useState(false);
  const displayedProviders = showAllProviders
    ? sortedRates
    : sortedRates.slice(0, 5);

  return (
    <section id="compare" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("rateTable.title", { country: t(`countries.${countryCode}`) })}
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            {t("rateTable.subtitle")}
          </p>
        </div>

        <Card className="p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0 mb-6">
            <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
              <div className="w-full md:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("rateTable.filter.currency")}
                </label>
                <Select
                  value={selectedCurrency}
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("rateTable.filter.amount")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">SAR</span>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="pl-12"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.label}
                  variant={
                    sortOption.label === option.label ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleSort(option)}
                  className="flex items-center justify-center gap-2 min-w-[120px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.key === "rate" ? "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" : (option.key === "fees" ? "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" : "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z")} />
                  </svg>
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="mt-2 text-gray-600">{t("rateTable.loading")}</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
              </div>
              <p className="text-red-600 font-medium">
                {t("rateTable.error")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                <i className="fas fa-redo mr-1"></i>
                {t("rateTable.retry")}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("rateTable.columns.provider")}</TableHead>
                      <TableHead className="text-right">
                        {t("rateTable.columns.rate")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("rateTable.columns.youGet")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("rateTable.columns.fees")}
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t("rateTable.columns.transferTime")}
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t("rateTable.columns.rating")}
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedProviders.map((provider: any) => (
                      <TableRow
                        key={provider.id}
                        className={
                          provider.highlight
                            ? "bg-blue-50 hover:bg-blue-100"
                            : "hover:bg-gray-50"
                        }
                      >
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-14 w-14">
                              {provider.logo ? (
                                <div
                                  className="h-14 w-14 rounded-md flex items-center justify-center p-1 overflow-hidden relative"
                                  style={{
                                    background: "#ffffff",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                  }}
                                >
                                  <img
                                    className="max-h-[90%] max-w-[90%] object-contain"
                                    style={{
                                      borderRadius: "4px",
                                      padding: "4px",
                                    }}
                                    src={provider.logo && provider.logo.startsWith('http') 
                                      ? provider.logo 
                                      : `/images/providers/${provider.providerKey}.jpeg`}
                                    alt={`${provider.name} logo`}
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      target.onerror = null;
                                      
                                      // Try different formats
                                      if (target.src.includes('.jpg')) {
                                        target.src = `/images/providers/${provider.providerKey}.png`;
                                      } else if (target.src.includes('.png')) {
                                        target.src = `/images/providers/${provider.providerKey}.svg`;
                                      } else {
                                        // Final fallback to text representation
                                        target.style.display = "none";
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.style.background = getAccentColor(
                                            provider.logoColor || "primary",
                                          );
                                          parent.innerHTML = `<span style="color: #ffffff; font-weight: bold;" class="text-lg">${
                                            provider.logoText ||
                                            provider.name.substring(0, 2).toUpperCase()
                                          }</span>`;
                                        }
                                      }
                                    }}
                                    loading="eager"
                                  />
                                </div>
                              ) : (
                                <div
                                  className="h-10 w-10 rounded-md flex items-center justify-center text-white font-bold text-lg"
                                  style={{
                                    backgroundColor: getAccentColor(
                                      provider.logoColor || "primary",
                                    ),
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                  }}
                                >
                                  {provider.logoText ||
                                    provider.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {getLocalizedName(provider.providerKey, provider.name)}
                                {provider.badge && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                    {t(`badges.${provider.badge.toLowerCase().replace(/\s+/g, '_')}`, {defaultValue: provider.badge})}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {t(`providerTypes.${provider.type.toLowerCase().replace(/\s+/g, '_')}`, {defaultValue: provider.type})}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {provider.rate.toFixed(4)}
                          </div>
                          <div className="text-xs flex items-center justify-end">
                            {provider.rateChange > 0 ? (
                              <span className="text-success-600">
                                <i className="fas fa-arrow-up mr-1"></i>
                                {provider.rateChange.toFixed(4)}
                              </span>
                            ) : provider.rateChange < 0 ? (
                              <span className="text-red-600">
                                <i className="fas fa-arrow-down mr-1"></i>
                                {Math.abs(provider.rateChange).toFixed(4)}
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                <i className="fas fa-minus mr-1"></i>
                                {provider.rateChange.toFixed(4)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {(provider.rate * amount).toFixed(2)}{" "}
                            {selectedCurrency}
                          </div>
                          <div className="text-xs text-gray-500">
                            1 SAR = {provider.rate.toFixed(4)}{" "}
                            {selectedCurrency}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {renderFees(provider)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {t(`feeTypeLabels.${provider.feeType.toLowerCase().replace(/\s+/g, '_')}`, {defaultValue: provider.feeType})}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm font-medium text-gray-900">
                            {provider.transferTime}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {renderStarRating(provider.rating)}
                        </TableCell>
                        <TableCell className="text-right">
                          <a
                            href={provider.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-blue-500 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[120px]"
                            style={{ color: '#ffffff', fontWeight: 'bold' }}
                          >
                            <span style={{ color: '#ffffff' }}>{t("rateTable.sendMoney")}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#ffffff' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {sortedRates.length > 5 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllProviders(!showAllProviders)}
                  >
                    {showAllProviders
                      ? t("rateTable.showLess")
                      : t("rateTable.showMore", {
                          count: sortedRates.length - 5,
                        })}
                  </Button>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 text-center">
                {lastUpdated && (
                  <p>
                    {t("rateTable.lastUpdated")}:{" "}
                    {new Date(lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </section>
  );
};

export default RateComparisonTable;