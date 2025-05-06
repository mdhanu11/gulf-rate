import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languageNames } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setIsOpen(false);
  };

  // Get current language
  const currentLanguage = i18n.language || 'en';
  const currentLanguageCode = currentLanguage.split('-')[0];
  const currentLanguageName = languageNames[currentLanguageCode] || 'English';

  // Get language code in uppercase (e.g., 'EN', 'AR')
  const displayCode = currentLanguageCode.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
        <span>{displayCode}</span>
        <i className="fas fa-globe text-xs"></i>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            className={`px-4 py-2 text-sm hover:bg-gray-100 ${
              code === currentLanguageCode ? 'border-l-2 border-primary-500' : ''
            }`}
            onClick={() => changeLanguage(code)}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
