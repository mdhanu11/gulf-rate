import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define country data
const countries = [
  { code: 'sa', name: 'Saudi Arabia', available: true, flag: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=20&h=20&fit=crop' },
  { code: 'ae', name: 'UAE', available: false, flag: 'https://images.unsplash.com/flagged/photo-1559717865-a99cac1c95d8?w=20&h=20&fit=crop' },
  { code: 'qa', name: 'Qatar', available: false, flag: 'https://images.unsplash.com/photo-1507904139316-3c7422a97a49?w=20&h=20&fit=crop' },
  { code: 'kw', name: 'Kuwait', available: false, flag: null },
  { code: 'bh', name: 'Bahrain', available: false, flag: null },
  { code: 'om', name: 'Oman', available: false, flag: null },
];

interface CountrySelectorProps {
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ className }) => {
  const { t } = useTranslation();
  const [location] = useLocation();
  
  // Extract current country code from URL
  const currentPath = location.split('/')[1].toLowerCase();
  const currentCountry = countries.find(c => c.code === currentPath) || countries[0];
  
  // Default to Saudi Arabia if no match
  const displayCountry = currentCountry || countries[0];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium ${className}`}>
        {displayCountry.flag ? (
          <img src={displayCountry.flag} alt={`${displayCountry.name} flag`} className="w-5 h-5 rounded-sm" />
        ) : (
          <i className="fas fa-flag text-gray-400 w-5 h-5 flex items-center justify-center"></i>
        )}
        <span className="uppercase">{displayCountry.code}</span>
        <i className="fas fa-chevron-down text-xs"></i>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {countries.map((country) => (
          <DropdownMenuItem key={country.code} asChild>
            <Link href={`/${country.code}`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              {country.flag ? (
                <img src={country.flag} alt={`${country.name} flag`} className="w-5 h-5 rounded-sm mr-2" />
              ) : (
                <i className="fas fa-flag text-gray-400 mr-2"></i>
              )}
              <span className="flex-1">{country.name}</span>
              {country.available ? (
                <span className="text-xs text-success-500 font-medium flex items-center">
                  <i className="fas fa-check-circle mr-1"></i>
                </span>
              ) : (
                <span className="text-xs text-gray-500">
                  {t('common.comingSoon')}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;
