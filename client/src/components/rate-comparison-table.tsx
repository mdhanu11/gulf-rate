import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useExchangeRates } from "@/hooks/use-exchange-rates";

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

  // Sort options for the rate comparison table
  const sortOptions: SortOption[] = [
    {
      key: "rate",
      direction: "desc",
      label: t("rateTable.sortOptions.bestRate"),
      icon: "fa-sort-amount-up",
    },
    {
      key: "fees",
      direction: "asc",
      label: t("rateTable.sortOptions.lowestFees"),
      icon: "fa-sort-amount-down",
    },
    {
      key: "rating",
      direction: "desc",
      label: t("rateTable.sortOptions.highestRated"),
      icon: "fa-sort-amount-up",
    },
  ];

  // Currencies for quick search
  const currencies = [
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "PKR", label: "PKR - Pakistani Rupee" },
    { value: "PHP", label: "PHP - Philippine Peso" },
    { value: "BDT", label: "BDT - Bangladeshi Taka" },
    { value: "NPR", label: "NPR - Nepalese Rupee" },
    { value: "EGP", label: "EGP - Egyptian Pound" },
    { value: "LKR", label: "LKR - Sri Lankan Rupee" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "EUR", label: "EUR - Euro" },
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
    } else if (provider.feeType === "Fixed fee") {
      return (
        <span>
          {provider.fees} {t("rateTable.sar")}
        </span>
      );
    } else if (provider.feeType === "Variable fee") {
      return (
        <span>
          {provider.fees} {t("rateTable.sar")} / {(provider.fees / amount * 100).toFixed(1)}%
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
                  className="flex items-center"
                >
                  <i className={`fas ${option.icon} mr-1`}></i>
                  {option.label}
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
                            <div className="flex-shrink-0 h-10 w-10">
                              {provider.logo ? (
                                <div
                                  className="h-10 w-10 rounded-md flex items-center justify-center p-1 overflow-hidden relative"
                                  style={{
                                    background: `linear-gradient(135deg, ${getAccentColor(
                                      provider.logoColor || "primary",
                                    )} 0%, #ffffff 100%)`,
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                  }}
                                >
                                  <img
                                    className="max-h-[85%] max-w-[85%] object-contain"
                                    style={{
                                      filter:
                                        "drop-shadow(0px 1px 1px rgba(0,0,0,0.1))",
                                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                                      borderRadius: "4px",
                                      padding: "4px",
                                    }}
                                    src={provider.logo}
                                    alt={`${provider.name} logo`}
                                    loading="eager"
                                    onError={(e) => {
                                      // Fall back to text logo on image load error
                                      const target = e.target as HTMLImageElement;
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
                                    }}
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
                                {provider.name}
                                {provider.badge && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                    {provider.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {provider.type}
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
                            {provider.feeType}
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
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            {t("rateTable.sendMoney")}{" "}
                            <i className="fas fa-external-link-alt ml-1"></i>
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